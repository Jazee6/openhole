import {CreateTopicDrawer, TopicCard, TopicList} from "../components/topic.tsx";
import {useEffect, useState} from "react";
import {getTopicListReq} from "@/api";
import {useGlobalStore, useTopicListStore} from "@/store";
import {randomNum} from "../utils/tools.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {EditIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {LoadingIcon} from "@/components/icons.tsx";

function Index() {
    const isLogin = useGlobalStore((state) => state.isLogin)
    const topicList = useTopicListStore((state) => state.topicList)
    const setTopicList = useTopicListStore((state) => state.setTopicList)
    const reload = useGlobalStore((state) => state.reload)
    const [topicDrawer, setTopicDrawer] = useState(false)
    const [init, setInit] = useState(false)

    useEffect(() => {
        getTopicListReq({limit: 15, offset: 0}).then(res => {
            setTopicList(res.data as TopicCard[])
            setInit(true)
        })
    }, [setTopicList, isLogin, reload]);

    useEffect(() => {
        if (init) {
            const loadMore = document.getElementById('load-more') as HTMLDivElement
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    getTopicListReq({limit: 15, offset: topicList.length}).then(res => {
                        const data = res.data as TopicCard[]
                        setTopicList([...topicList, ...data])
                        if (data.length < 15) {
                            observer.unobserve(loadMore)
                            loadMore.remove()
                        }
                    })
                }
            })
            observer.observe(loadMore)

            return () => {
                observer.unobserve(loadMore)
            }
        }
    }, [init]);

    function handleNewPost() {
        setTopicDrawer(true)
    }

    return (
        <div className="container-global min-h-screen flex flex-col">
            {topicList.length ? <TopicList className="pt-16" TopicList={topicList}/> :
                <ul className="pt-16">
                    {
                        Array.from({length: randomNum(1, 10)}).map((_, i) => (
                            <Skeleton key={i} className="w-full h-20 mt-2 rounded-md"/>
                        ))
                    }
                </ul>
            }

            <div id="load-more" className="h-16 w-full flex justify-center">
                <LoadingIcon className="h-full animate-spin"/>
            </div>

            {isLogin &&
                <div className="flex justify-end sticky bottom-4 right-4 sm:right-6 lg:right-8 mt-auto">
                    <Button onClick={handleNewPost}
                            className="bg-primary hover:opacity-70 rounded-full h-16 w-16 transition-all shadow-xl">
                        <EditIcon/>
                    </Button>
                </div>
            }

            <CreateTopicDrawer topicDrawer={topicDrawer} setTopicDrawer={setTopicDrawer}/>
        </div>
    );
}

export default Index;
