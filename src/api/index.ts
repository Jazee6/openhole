import {getFetch, postFetch} from "./helper.ts";
import {z} from "zod";
import {createTopicSchema} from "@/server/utils/validator.ts";

interface LoginReq {
    email: string
    password: string
}

export function loginReq({email, password}: LoginReq) {
    return postFetch("/account/login", new URLSearchParams({
        email,
        password,
    }))
}

interface RegisterReq {
    email: string
    password: string
    tid: number
}

export function registerReq({email, password, tid}: RegisterReq) {
    return postFetch("/account/register", new URLSearchParams({
        email,
        password,
        tid: tid.toString(),
    }))
}

interface GetTopicListReq {
    limit: number
    offset: number
}

export function getTopicListReq({limit, offset}: GetTopicListReq) {
    return getFetch('/topic', new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    }))
}

export function getTagsReq(keyword: string) {
    return getFetch('/account/tags', new URLSearchParams({
        keyword,
    }))
}

export function starReq(topic_id: number) {
    return postFetch('/auth/star', new URLSearchParams({
        topic_id: topic_id.toString(),
    }))
}

export function unStarReq(topic_id: number) {
    return postFetch('/auth/unstar', new URLSearchParams({
        topic_id: topic_id.toString(),
    }))
}

export function getStarListReq({limit, offset}: GetTopicListReq) {
    return getFetch('/auth/star/me', new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    }))
}

export function createTopicReq({content}: z.infer<typeof createTopicSchema>) {
    return postFetch('/auth/topic', new URLSearchParams({
        content,
    }))
}
