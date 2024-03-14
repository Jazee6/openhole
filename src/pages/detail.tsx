import {CommentList, TopicCard} from "@/components/topic.tsx";
import {CommentData, TopicCardType} from "@/utils/types.ts";
import {useEffect, useReducer, useState} from "react";
import {getComments, getTopic} from "@/api";
import {useLoaderData} from "react-router-dom";
import {Skeleton} from "@/components/ui/skeleton.tsx";

const reducer = (state: TopicCardType, action: {
    type: string,
    payload: {
        data: unknown
    },
}) => {
    switch (action.type) {
        case 'setStarOne':
            return {...state, starred: action.payload.data as number}
        case 'setUnStarOne':
            return {...state, starred: null}
        case 'setTopic':
            return action.payload.data as TopicCardType
        default:
            throw new Error(`Unknown action: ${action.type}`)
    }
}

function Detail() {
    const id = useLoaderData() as number | null
    const [topic, dispatch] = useReducer(reducer, {} as TopicCardType);
    const [commentList, setCommentList] = useState<CommentData[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        getTopic({id}).then(res => {
            dispatch({type: 'setTopic', payload: {data: res.data as TopicCardType}})
        })
        getComments({topic_id: id, limit: 15, offset: 0}).then(res => {
            setLoading(false)
            setCommentList(res.data as CommentData[])
        })
    }, [id]);

    return (
        <div className="pt-16 container-global">
            {topic.id ?
                <TopicCard className="mt-2" {...topic} isDetail dispatch={dispatch}/> :
                <Skeleton className="w-full h-20 mt-2 rounded-md bg-card"/>
            }

            <h2 className="font-bold text-2xl mt-4">Comments</h2>

            {loading ?
                Array.from({length: 5}).map((_, i) => (
                    <Skeleton key={i} className="w-full h-20 mt-2 rounded-md bg-card"/>
                )) :
                (commentList.length ? <CommentList CommentList={commentList}/> :
                    <div className="pt-4 text-center">No comments yet</div>)
            }
        </div>
    );
}

export default Detail;