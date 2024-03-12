import {useLoaderData} from "react-router-dom";

interface CommentData {
    id: number,
    uid: number,
    root_id: number | null,
    to_id: number | null,
    content: string,
    created_at: string,
    verified: number,
    tag: string,
    replies: CommentData[],
}

function Detail() {
    const {data} = useLoaderData() as { data: CommentData[] }

    return (
        <div>
            {data.map(comment => (
                <div key={comment.id}>
                    <p>{comment.content}</p>
                    {comment.replies.map(reply => (
                        <div key={reply.id}>
                            <p>{reply.content}</p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default Detail;