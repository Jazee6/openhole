import {Hono} from 'hono'
import {Bindings, getPayload, Payload} from "./utils/tools.ts"
import {zValidator} from "@hono/zod-validator"
import {createHonoWithCors, getUUID} from "./utils/tools.ts"
import {jwt, sign} from "hono/jwt"
import sha1 from 'crypto-js/sha1'
import {
    createTopicSchema,
    getTagsSchema,
    getTopicListSchema,
    loginSchema, myStarredTopicSchema,
    registerSchema,
    starTopicSchema
} from "./utils/validator.ts";

const account = createHonoWithCors()

account.post('/register', zValidator('form', registerSchema), async c => {
    const {email, password, tid} = c.req.valid('form')
    const db = c.env.D1

    const account = await db.prepare('SELECT email FROM accounts WHERE email = ?').bind(email).first()
    if (account !== null) {
        return c.text('Email already exists', 400)
    }

    const id = getUUID()
    const result = await db.prepare('INSERT INTO accounts (id, tid, email, password) VALUES (?, ?, ?, ?)').bind(id, tid, email, sha1(password).toString()).run()
    if (result.success) {
        const payload: Payload = {id}
        const res = {
            message: 'Success to register',
            data: {
                token: await sign(payload, c.env.JWT_SECRET)
            }
        }
        return c.json(res)
    } else {
        return c.text('Failed to register', 500)
    }
})

account.post('/login', zValidator('form', loginSchema), async c => {
    const {email, password} = c.req.valid('form')
    const db = c.env.D1

    const account = await db.prepare('SELECT id FROM accounts WHERE email = ? AND password = ?').bind(email, sha1(password).toString()).first()
    if (account === null) {
        return c.text('Invalid email or password', 400)
    }

    const payload: Payload = {id: account.id as string}
    const res = {
        message: 'Success to login',
        data: {
            token: await sign(payload, c.env.JWT_SECRET)
        }
    }
    return c.json(res)
})

account.get('/tags', zValidator('query', getTagsSchema), async c => {
    const {keyword} = c.req.valid('query')
    const db = c.env.D1

    const {results} = await db.prepare('SELECT * FROM tags WHERE name LIKE ? limit 8').bind(`%${keyword}%`).all()
    return c.json({data: results})
})

const auth = createHonoWithCors()
auth.use((c, next) => {
    const jwtMiddleware = jwt({
        secret: c.env.JWT_SECRET,
    })
    return jwtMiddleware(c, next)
})

auth.post('/topic', zValidator('form', createTopicSchema), async c => {
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

const topic = createHonoWithCors()
topic.get('/', zValidator('query', getTopicListSchema), async c => {
    const {limit, offset} = c.req.valid('query')
    const db = c.env.D1

    const token = c.req.header().authorization?.substring(7)
    let uid: string
    if (token !== undefined) {
        const payload: Payload = await getPayload(token, c.env.JWT_SECRET)
        uid = payload.id

        const {results} = await db.prepare('SELECT a.id, a.content, a.star, a.created_at, b.verified, c.name tag, d.topic_id starred FROM topics a left join accounts b on a.uid=b.id left join tags c on b.tid=c.id left join stars d on a.id=d.topic_id and d.uid=? order by a.created_at desc limit ? offset ?').bind(uid, limit, offset).all()
        return c.json({data: results})
    }

    const {results} = await db.prepare('SELECT a.id, a.content, a.star, a.created_at, b.verified, c.name tag FROM topics a left join accounts b on a.uid=b.id left join tags c on b.tid=c.id order by a.created_at desc limit ? offset ?').bind(limit, offset).all()
    return c.json({data: results})
})

const app = new Hono<{ Bindings: Bindings }>().route('/account', account).route('/auth', auth).route('/topic', topic)

app.all('*', c => c.redirect(c.env.SITE_URL))

export default app
