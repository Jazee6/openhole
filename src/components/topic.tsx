import {CommentData, TopicCardType, WithClassName} from "../utils/types.ts";
import clsx from "clsx";
import dayjs from "dayjs";
import {IButton, StarFillIcon, StarIcon, VerifiedIcon} from "./icons.tsx";
import {createTopicReq, starReq, unStarReq} from "@/api";
import {useGlobalStore, useTopicListStore} from "@/store";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import {Button} from "@/components/ui/button.tsx";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {createTopicSchema} from "@/server/utils/validator.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form.tsx";
import {Loader2} from "lucide-react";
import {cn} from "@/utils/utils.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {useNavigate} from "react-router-dom";
import {getAnonymousSub, handleLink} from "@/utils/tools.ts";

interface TopicCardProps extends WithClassName, TopicCardType {
    isDetail?: boolean,
    dispatch?: (action: { type: string, payload: { data: unknown } }) => void
}

export function TopicCard({
                              id,
                              tag,
                              created_at,
                              content,
                              verified,
                              starred,
                              star,
                              className,
                              isDetail,
                              dispatch
                          }: TopicCardProps) {
    const setStar = useTopicListStore((state) => state.setTopicStar)
    const setUnStar = useTopicListStore((state) => state.setTopicUnStar)
    const nav = useNavigate()

    function handleStar(e: MouseEvent) {
        e.stopPropagation()

        const req = {
            topic_id: id,
        }
        if (starred === null) {
            starReq(req).then(() => {
                if (isDetail) {
                    dispatch && dispatch({type: 'setStarOne', payload: {data: id}})
                    return
                }
                setStar(id, star)
            })
        } else {
            unStarReq(req).then(() => {
                if (isDetail) {
                    dispatch && dispatch({type: 'setUnStarOne', payload: {data: null}})
                    return
                }
                setUnStar(id, star)
            })
        }
    }

    async function handleDetail() {
        if (isDetail) return
        nav(`/topic/${id}`)
    }

    return (
        <div onClick={handleDetail}
             className={clsx(className, "flex flex-col p-2 bg-card rounded-md hover:cursor-pointer hover:ring-1 ring-primary transition-all space-y-1")}>
            <div className={"relative flex items-baseline"}>
                <span className={"font-bold text-primary"}>#{id}</span>
                <span className={"text-primary ml-2"}>{tag}</span>
                {verified !== 0 && <VerifiedIcon className={"fill-primary w-5 h-5 relative top-1 ml-1"}/>}
                <span className={"text-secondary-foreground text-xs ml-1"}>{dayjs.tz(created_at).fromNow()}</span>
                <div className={"absolute right-0 top-0"}>
                    <span className={"text-sm absolute top-2 right-8 text-warning"}>{star}</span>
                    {starred ? <IButton onClick={handleStar}><StarFillIcon
                            className="fill-warning"/></IButton> :
                        <IButton onClick={handleStar}><StarIcon className={"fill-warning"}/></IButton>}
                </div>
            </div>
            <div className={isDetail ? "break-words" : "break-words line-clamp-5"}
                 dangerouslySetInnerHTML={handleLink(content)}/>
        </div>
    );
}

interface TopicListProps extends WithClassName {
    TopicList: TopicCardProps[],
}

export function TopicList({TopicList, className}: TopicListProps) {
    return (
        <ol className={className}>
            {TopicList.map((topic) => (
                <li key={topic.id}>
                    <TopicCard className={"mt-2"} {...topic}/>
                </li>
            ))}
        </ol>
    );
}

export function CreateTopicDrawer({topicDrawer, setTopicDrawer}: {
    topicDrawer: boolean,
    setTopicDrawer: (b: boolean) => void
}) {
    return (
        <Drawer open={topicDrawer} onOpenChange={setTopicDrawer}>
            <DrawerContent className="h-1/2 container-global">
                <DrawerHeader>
                    <DrawerTitle>发布讨论</DrawerTitle>
                    <DrawerDescription>匿名</DrawerDescription>
                </DrawerHeader>
                <CreateTopicForm setTopicDrawer={setTopicDrawer}/>

            </DrawerContent>
        </Drawer>
    )
}

function CreateTopicForm({setTopicDrawer}: { setTopicDrawer: (b: boolean) => void }) {
    const setReload = useGlobalStore((state) => state.setReload)
    const [buttonDisabled, setButtonDisabled] = useState(false)

    const form = useForm<z.infer<typeof createTopicSchema>>({
        resolver: zodResolver(createTopicSchema),
        defaultValues: {
            content: "",
        }
    })

    function onSubmit(values: z.infer<typeof createTopicSchema>) {
        setButtonDisabled(true)

        createTopicReq(values).then(() => {
            setTopicDrawer(false)
            setReload()
        }).finally(() => {
            setButtonDisabled(false)
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                    control={form.control}
                    name="content"
                    render={({field}) => (
                        <FormItem className="px-4 h-full">
                            <FormControl>
                                <Textarea className="h-full" placeholder="说点什么..." {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <DrawerFooter>
                    <div className="flex justify-end space-x-2">
                        <Button disabled={buttonDisabled} type="submit">
                            <Loader2 className={cn("mr-2 h-4 w-4 animate-spin", buttonDisabled ? "block" : "hidden")}/>
                            发布
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setTopicDrawer(false)}>取消</Button>
                    </div>
                </DrawerFooter>
            </form>
        </Form>
    )
}

export interface CommentCardProps extends WithClassName, CommentData {

}

function CommentCard({
                         replies,
                         className,
                         ...reply
                     }: CommentCardProps) {

    return (
        <div className={clsx(className, "flex flex-col p-2 rounded-md space-y-1 bg-card")}>
            <div className="flex items-baseline">
                <span className="text-primary text-sm">{reply.tag}</span>
                {reply.verified !== 0 &&
                    <VerifiedIcon className={"fill-primary w-3.5 h-3.5 relative top-0.5 left-0.5"}/>}
                <span className="text-secondary-foreground text-xs ml-1">{dayjs.tz(reply.created_at).fromNow()}</span>
                <span className="text-primary text-xs ml-auto">R#{reply.id}</span>
            </div>
            <div
                className="flex items-center hover:bg-secondary hover:cursor-pointer rounded-md transition-all">
                <span>{reply.uid !== 0 ? getAnonymousSub(reply.uid - 1) : "洞主"}</span>
                <span className="ml-4 line-clamp-5">{reply.content}</span>
            </div>
            {replies.length > 0 && <SubCommentCard replies={replies}/>}
        </div>
    )
}

function SubCommentCard({replies}: { replies: CommentData[] }) {

    return <div className="ml-4">
        {replies.map(reply => <SubCommentItem key={reply.id} {...reply} />)}
    </div>
}

function SubCommentItem(subReply: CommentData) {

    return (
        <div
            className="flex items-center text-sm rounded-md hover:bg-secondary hover:cursor-pointer transition-all">
            <span>{subReply.uid !== 0 ? getAnonymousSub(subReply.uid - 1) : "洞主"}</span>
            <span
                className="shrink-0">{subReply.to_uid !== null ? '回复' + getAnonymousSub(subReply.to_uid! - 1) : ""}</span>
            <span className="ml-4 line-clamp-2">{subReply.content}</span>
        </div>
    );
}

export function CommentList({CommentList, className}: { CommentList: CommentData[], className?: string }) {
    return (
        <ol className={className}>
            {CommentList.map(comment => (
                <li key={comment.id}>
                    <CommentCard className="mt-2" {...comment}/>
                </li>
            ))}
        </ol>
    );
}
