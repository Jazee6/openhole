import {v4} from 'uuid';
import {Hono} from "hono";
import {cors} from 'hono/cors'
import {verify} from "hono/jwt";
import {createMiddleware} from "hono/factory";
import {csrf} from "hono/csrf";
import {secureHeaders} from 'hono/secure-headers'

export function getUUID() {
    return v4().split('-').join('')
}

export type Bindings = {
    D1: D1Database
    readonly JWT_SECRET: string
    readonly SITE_URL: string
    readonly RECAPTCHA: string
}

export interface Payload {
    id: string
    // TODO exp
}

export function createHonoWithCors() {
    return new Hono<{ Bindings: Bindings }>().use((c, next) => {
        const corsMiddleware = cors({
            origin: c.env.SITE_URL,
            exposeHeaders: ['Authorization']
        })
        return corsMiddleware(c, next)
    })
        // .use((c, next) => {
        //     const csrfMiddleware = csrf({
        //         origin: c.env.SITE_URL,
        //     })
        //     return csrfMiddleware(c, next)
        // }).use(secureHeaders())
}

export async function getPayload(token: string, secret: string) {
    return await verify(token, secret)
}

export async function verifyRecaptcha(token: string, secret: string) {
    const res = await fetch('https://www.recaptcha.net/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `secret=${secret}&response=${token}`
    });
    return await res.json();
}

interface RecaptchaRes {
    success: boolean
    challenge_ts: string
    hostname: string,
    score: number
    action: string
}

export const recaptchaMiddleware = createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
    const token = c.req.header().recaptcha
    if (token === undefined) {
        return c.text('Recaptcha token is required', 400)
    }
    const res = await verifyRecaptcha(token, c.env.RECAPTCHA) as RecaptchaRes
    if (!res.success) {
        return c.text('Recaptcha failed', 403)
    }
    await next()
})
