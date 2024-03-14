import {getFetch, postFetch, postFetchWithRecaptcha} from "./helper.ts";
import {z} from "zod";
import {
    createCommentSchema,
    createTopicSchema,
    getCommentListSchema, getTagsSchema, getTopicListSchema, getTopicSchema,
    loginSchema, myStarredTopicSchema,
    registerSchema, starTopicSchema
} from "@/server/utils/validator.ts";

export function loginReq({email, password}: z.infer<typeof loginSchema>) {
    return postFetchWithRecaptcha("/account/login", new URLSearchParams({
        email,
        password,
    }))
}

export function registerReq({email, password, tid}: z.infer<typeof registerSchema>) {
    return postFetchWithRecaptcha("/account/register", new URLSearchParams({
        email,
        password,
        tid: tid.toString(),
    }))
}

export function getTopicListReq({limit, offset}: z.infer<typeof getTopicListSchema>) {
    return getFetch('/topic', new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    }))
}

export function getTagsReq({keyword}: z.infer<typeof getTagsSchema>) {
    return getFetch('/account/tags', new URLSearchParams({
        keyword,
    }))
}

export function starReq({topic_id}: z.infer<typeof starTopicSchema>) {
    return postFetch('/auth/star', new URLSearchParams({
        topic_id: topic_id.toString(),
    }))
}

export function unStarReq({topic_id}: z.infer<typeof starTopicSchema>) {
    return postFetch('/auth/unstar', new URLSearchParams({
        topic_id: topic_id.toString(),
    }))
}

export function getStarListReq({limit, offset}: z.infer<typeof myStarredTopicSchema>) {
    return getFetch('/auth/star/me', new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    }))
}

export function createTopicReq({content}: z.infer<typeof createTopicSchema>) {
    return postFetchWithRecaptcha('/auth/topic', new URLSearchParams({
        content,
    }))
}

export function getComments({topic_id, limit, offset}: z.infer<typeof getCommentListSchema>) {
    return getFetch('/auth/comment', new URLSearchParams({
        topic_id: topic_id.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
    }))
}

export function createComment({topic_id, root_id, to_id, content}: z.infer<typeof createCommentSchema>) {
    return postFetchWithRecaptcha('/auth/comment', new URLSearchParams({
        topic_id: topic_id.toString(),
        root_id: root_id?.toString() ?? "",
        to_id: to_id?.toString() ?? "",
        content,
    }))
}

export function getTopic({id}: z.infer<typeof getTopicSchema>) {
    return getFetch(`/topic/${id}`)
}
