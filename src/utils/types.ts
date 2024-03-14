export interface WithClassName {
    className?: string;
}

export interface CommentData {
    id: number,
    uid: number,
    root_id?: number,
    to_uid?: number | null,
    content: string,
    created_at: string,
    verified: number,
    tag: string,
    replies: CommentData[],
}

export interface TopicCardType {
    id: number,
    tag: string,
    created_at: string,
    content: string,
    verified: number,
    starred: number | null,
    star: number,
}
