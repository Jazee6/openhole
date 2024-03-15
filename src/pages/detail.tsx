import {CommentDrawerProps, CommentList, CreateCommentDrawer, TopicCard} from "@/components/topic.tsx";
import {CommentData, TopicCardType} from "@/utils/types.ts";
import {useEffect, useReducer, useState} from "react";
import {getComments, getTopic} from "@/api";
import {useLoaderData} from "react-router-dom";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Button} from "@/components/ui/button.tsx";
import {EditIcon} from "lucide-react";
import {useGlobalStore} from "@/store";
import {isLogin} from "@/utils/tools.ts";

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
    const commentDrawer = useGlobalStore((state) => state.commentDrawer)
    const setCommentDrawer = useGlobalStore((state) => state.setCommentDrawer)
    const reload = useGlobalStore((state) => state.reload)
    const commentDrawerData = useGlobalStore((state) => state.commentDrawerData)
    const setCommentDrawerData = useGlobalStore((state) => state.setCommentDrawerData)

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
    }, [id, reload]);

    function handleNewComment() {
        setCommentDrawer(true)
        setCommentDrawerData({})
    }

    const commentDrawerProps: CommentDrawerProps = {
        CommentDrawer: commentDrawer,
        topicID: id ? id : topic.id,
        setCommentDrawer,
        ...commentDrawerData
    }

    return (
        <div className="pt-16 container-global flex flex-col min-h-screen">
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

            {isLogin() &&
                <div className="flex justify-end sticky bottom-4 right-4 sm:right-6 lg:right-8 mt-auto">
                    <Button onClick={handleNewComment}
                            className="bg-primary hover:opacity-70 rounded-full h-16 w-16 transition-all shadow-xl">
                        <EditIcon/>
                    </Button>
                </div>
            }

            <CreateCommentDrawer {...commentDrawerProps}/>
        </div>
    );
}

export default Detail;