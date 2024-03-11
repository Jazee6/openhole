import {v4} from 'uuid';
import {Hono} from "hono";
import {cors} from 'hono/cors'
import {verify} from "hono/jwt";

export function getUUID() {
    return v4().split('-').join('')
}

export type Bindings = {
    D1: D1Database
    readonly JWT_SECRET: string,
    readonly SITE_URL: string
}

export interface Payload {
    id: string
}

export function createHonoWithCors() {
    return new Hono<{ Bindings: Bindings }>().use((c, next) => {
        const corsMiddleware = cors({
            origin: c.env.SITE_URL,
        })
        return corsMiddleware(c, next)
    })
}

export async function getPayload(token: string, secret: string) {
    return await verify(token, secret)
}
