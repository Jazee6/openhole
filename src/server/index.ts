import {Hono} from 'hono'
import {
    Bindings,
    createHono,
    getPayload,
    getUUID,
    Payload,
    recaptchaMiddleware,
} from "./utils/tools.ts"
import {zValidator} from "@hono/zod-validator"
import {jwt, sign} from "hono/jwt"
import sha1 from 'crypto-js/sha1'
import {
    createCommentSchema,
    createTopicSchema,
    getCommentListSchema,
    getTagsSchema,
    getTopicListSchema, getTopicSchema,
    loginSchema,
    myStarredTopicSchema,
    registerSchema,
    starTopicSchema
} from "./utils/validator.ts";
import {showRoutes} from 'hono/dev'

const account = createHono()

account.post('/register', recaptchaMiddleware, zValidator('form', registerSchema), async c => {
    const {email, password, tid} = c.req.valid('form')
    const db = c.env.D1

    const account = await db.prepare('SELECT email FROM accounts WHERE email = ?').bind(email).first()
    if (account !== null) {
        return c.text('Email already exists', 400)
    }

    const id = getUUID()
    const result = await db.prepare('INSERT INTO accounts (id, tid, email, password) VALUES (?, ?, ?, ?)').bind(id, tid, email, sha1(password).toString()).run()
    if (result.success) {
        const payload: Payload = {
            id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 * 3 // 3 months
        }
        c.header('Authorization', `Bearer ${await sign(payload, c.env.JWT_SECRET)}`)
        return c.json({message: 'Success to register'})
    } else {
        return c.text('Failed to register', 500)
    }
})

account.post('/login', recaptchaMiddleware, zValidator('form', loginSchema), async c => {
    const {email, password} = c.req.valid('form')
    const db = c.env.D1

    const account = await db.prepare('SELECT id FROM accounts WHERE email = ? AND password = ?').bind(email, sha1(password).toString()).first()
    if (account === null) {
        return c.text('Invalid email or password', 400)
    }

    const payload: Payload = {
        id: account.id as string,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 * 3 // 3 months
    }
    c.header('Authorization', `Bearer ${await sign(payload, c.env.JWT_SECRET)}`)
    return c.json({message: 'Success to login'})
})

account.get('/tags', zValidator('query', getTagsSchema), async c => {
    const {keyword} = c.req.valid('query')
    const db = c.env.D1

    const {results} = await db.prepare('SELECT * FROM tags WHERE name LIKE ? limit 8').bind(`%${keyword}%`).all()
    return c.json({data: results})
})

const auth = createHono()
auth.use((c, next) => {
    const jwtMiddleware = jwt({
        secret: c.env.JWT_SECRET,
    })
    return jwtMiddleware(c, next)
})

auth.post('/topic', recaptchaMiddleware, zValidator('form', createTopicSchema), async c => {
    const {id: uid} = c.get('jwtPayload')
    const {content} = c.req.valid('form')
    const db = c.env.D1

    const res = await db.prepare('INSERT INTO topics (uid, content) VALUES (?, ?)').bind(uid, content).run()
    if (res.success) {
        return c.json({message: 'Success to create topic'})
    } else {
        return c.text('Failed to create topic', 500)
    }
})

auth.post('/star', zValidator('form', starTopicSchema), async c => {
    const {id: uid} = c.get('jwtPayload')
    const {topic_id} = c.req.valid('form')
    const db = c.env.D1

    const starred = await db.prepare('SELECT id FROM stars WHERE uid = ? AND topic_id = ?').bind(uid, topic_id).first()
    if (starred !== null) {
        return c.text('Already starred', 400)
    }

    const res = await db.batch([
        db.prepare('INSERT INTO stars (uid, topic_id) VALUES (?, ?)').bind(uid, topic_id),
        db.prepare('UPDATE topics SET star = star + 1 WHERE id = ?').bind(topic_id)
    ])

    res.forEach(r => {
        if (!r.success) {
            return c.text('Failed to star topic', 500)
        }
    })
    return c.json({message: 'Success to star'})
})

auth.post('/unstar', zValidator('form', starTopicSchema), async c => {
    const {id: uid} = c.get('jwtPayload')
    const {topic_id} = c.req.valid('form')
    const db = c.env.D1

    const starred = await db.prepare('SELECT id FROM stars WHERE uid = ? AND topic_id = ?').bind(uid, topic_id).first()
    if (starred === null) {
        return c.text('Already canceled star', 400)
    }

    const res = await db.batch([
        db.prepare('DELETE FROM stars WHERE uid = ? AND topic_id = ?').bind(uid, topic_id),
        db.prepare('UPDATE topics SET star = star - 1 WHERE id = ?').bind(topic_id)
    ])

    res.forEach(r => {
        if (!r.success) {
            return c.text('Failed to cancel star', 500)
        }
    })
    return c.json({message: 'Success to cancel star'})
})

auth.get('/star/me', zValidator('query', myStarredTopicSchema), async c => {
    const {id: uid} = c.get('jwtPayload')
    const {limit, offset} = c.req.valid('query')
    const db = c.env.D1

    const {results} = await db.prepare('SELECT a.topic_id starred, a.created_at starred_at,b.id, b.content, b.star, b.created_at ,c.verified, d.name tag from stars a left join topics b on a.topic_id=b.id left join accounts c on b.uid=c.id left join tags d on c.tid=d.id where a.uid=? order by starred_at desc limit ? offset ?').bind(uid, limit, offset).all()
    return c.json({data: results})
})

auth.post('/comment', recaptchaMiddleware, zValidator('form', createCommentSchema), async c => {
    const {id: uid} = c.get('jwtPayload')
    const {topic_id, root_id, to_id, content} = c.req.valid('form')
    const db = c.env.D1

    let res
    if (root_id !== undefined) {
        if (to_id !== undefined) {
            const r = await db.prepare('SELECT uid FROM comments WHERE id=?').bind(to_id).first()
            if (r === null) {
                return c.text('To comment not found', 404)
            }
            if (r.uid === uid) {
                res = await db.prepare('INSERT INTO comments (uid, topic_id, root_id, content) VALUES (?, ?, ?, ?)').bind(uid, topic_id, root_id, content).run()
                if (res.success) {
                    return c.json({message: 'Success to create comment'})
                }
            }
            res = await db.prepare('INSERT INTO comments (uid, topic_id, root_id, to_id, to_uid, content) VALUES (?, ?, ?, ?, ?, ?)').bind(uid, topic_id, root_id, to_id, r.uid, content).run()
        } else {
            res = await db.prepare('INSERT INTO comments (uid, topic_id, root_id, content) VALUES (?, ?, ?, ?)').bind(uid, topic_id, root_id, content).run()
        }
    } else res = await db.prepare('INSERT INTO comments (uid, topic_id, content) VALUES (?, ?, ?)').bind(uid, topic_id, content).run()

    if (res.success) {
        return c.json({message: 'Success to create comment'})
    } else {
        return c.text('Failed to create comment', 500)
    }
})

auth.get('/comment', zValidator('query', getCommentListSchema), async c => {
    const {topic_id, limit, offset} = c.req.valid('query')
    const db = c.env.D1

    const res = await db.prepare('select uid from topics where id=?').bind(topic_id).first()
    if (res === null) {
        return c.text('Topic not found', 404)
    }

    const {results} = await db.prepare('SELECT a.id, a.uid, a.content, a.created_at, b.verified, c.name tag FROM comments a left join accounts b on a.uid=b.id left join tags c on b.tid=c.id where a.topic_id=? and a.root_id IS NULL and a.to_id is null order by a.created_at desc limit ? offset ?').bind(topic_id, limit, offset).all()
    const m = new Map<string, number>()
    let i = 0
    m.set(res.uid as string, i++)
    for (const comment of results) {
        const uid = comment.uid as string
        if (!m.has(uid)) {
            m.set(uid, i++)
        }
        comment.uid = m.get(uid)
    }

    for (const comment of results) {
        const {results} = await db.prepare('SELECT a.id, a.uid, a.root_id, a.to_uid, a.content, a.created_at, b.verified, c.name tag FROM comments a left join accounts b on a.uid=b.id left join tags c on b.tid=c.id where a.root_id=? order by a.created_at desc limit 3').bind(comment.id).all()
        for (const comment of results) {
            const uid = comment.uid as string
            if (!m.has(uid)) {
                m.set(uid, i++)
            }
            if (comment.to_uid !== null) {
                const to_uid = comment.to_uid as string
                if (!m.has(to_uid)) {
                    m.set(to_uid, i++)
                }
                comment.to_uid = m.get(to_uid)
            }
            comment.uid = m.get(uid)
        }
        comment.replies = results
    }

    return c.json({data: results})
})

const topic = createHono()
topic.get('/', zValidator('query', getTopicListSchema), async c => {
    const {limit, offset} = c.req.valid('query')
    const db = c.env.D1

    const token = c.req.header().authorization?.substring(7)
    let uid: string
    if (token !== undefined) {
        let payload: Payload
        try {
            payload = await getPayload(token, c.env.JWT_SECRET)
        } catch (e) {
            return c.text(e as string, 401)
        }
        uid = payload.id

        const {results} = await db.prepare('SELECT a.id, a.content, a.star, a.created_at, b.verified, c.name tag, d.topic_id starred FROM topics a left join accounts b on a.uid=b.id left join tags c on b.tid=c.id left join stars d on a.id=d.topic_id and d.uid=? order by a.created_at desc limit ? offset ?').bind(uid, limit, offset).all()
        return c.json({data: results})
    }

    const {results} = await db.prepare('SELECT a.id, a.content, a.star, a.created_at, b.verified, c.name tag FROM topics a left join accounts b on a.uid=b.id left join tags c on b.tid=c.id order by a.created_at desc limit ? offset ?').bind(limit, offset).all()
    return c.json({data: results})
})

topic.get('/:id', zValidator('param', getTopicSchema), async c => {
    const {id} = c.req.valid('param')
    const db = c.env.D1

    const token = c.req.header().authorization?.substring(7)
    let uid: string
    if (token !== undefined) {
        let payload: Payload
        try {
            payload = await getPayload(token, c.env.JWT_SECRET)
        } catch (e) {
            return c.text(e as string, 401)
        }
        uid = payload.id

        const res = await db.prepare('SELECT a.id, a.content, a.star, a.created_at, b.verified, c.name tag, d.topic_id starred FROM topics a left join accounts b on a.uid=b.id left join tags c on b.tid=c.id left join stars d on a.id=d.topic_id and d.uid=? where a.id=?').bind(uid, id).first()
        if (res === null) {
            return c.text('Topic not found', 404)
        }
        return c.json({data: res})
    }

    const res = await db.prepare('select a.id, a.content, a.star, a.created_at, b.verified, c.name tag from topics a left join accounts b on a.uid=b.id left join tags c on b.tid=c.id where a.id=?').bind(id).first()
    if (res === null) {
        return c.text('Topic not found', 404)
    }
    return c.json({data: res})
})

const app = new Hono<{ Bindings: Bindings }>().route('/account', account).route('/auth', auth).route('/topic', topic)

app.all('*', c => c.redirect(c.env.SITE_URL))

showRoutes(app)

export default app
