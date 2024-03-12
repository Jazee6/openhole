import {z} from 'zod';

const basicPagination = {
    limit: z.coerce.number().min(1).max(25),
    offset: z.coerce.number().int().min(0),
}

export const registerSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().trim().min(8).max(64),
    tid: z.coerce.number().int(),
})

export const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().trim().min(8).max(64),
})

export const createTopicSchema = z.object({
    content: z.string().trim().min(1).max(4096),
})

export const getTagsSchema = z.object({
    keyword: z.string().trim().min(1).max(64),
})

export const getTopicListSchema = z.object(basicPagination)

export const getTopicSchema = z.object({
    topic_id: z.coerce.number().int(),
})

export const starTopicSchema = z.object({
    topic_id: z.coerce.number().int(),
})

export const myStarredTopicSchema = z.object(basicPagination)

export const getCommentListSchema = z.object({
    topic_id: z.coerce.number().int(),
    ...basicPagination,
})

export const createCommentSchema = z.object({
    topic_id: z.coerce.number().int(),
    root_id: z.coerce.number().int().optional(),
    to_id: z.coerce.number().int().optional(),
    content: z.string().trim().min(1).max(4096),
})
