import {CreateTopicDrawer, TopicCard, TopicList} from "../components/topic.tsx";
import {useEffect, useState} from "react";
import {getTopicListReq} from "@/api";
import {useGlobalStore, useTopicListStore} from "@/store";
import {randomNum} from "../utils/tools.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {EditIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";

function Index() {
    const isLogin = useGlobalStore((state) => state.isLogin)
    const topicList = useTopicListStore((state) => state.topicList)
    const setTopicList = useTopicListStore((state) => state.setTopicList)
    const reload = useGlobalStore((state) => state.reload)
    const [topicDrawer, setTopicDrawer] = useState(false)

    useEffect(() => {
        getTopicListReq({limit: 10, offset: 0}).then((res) => {
            setTopicList(res.data as TopicCard[])
        })
    }, [setTopicList, isLogin, reload]);

    function handleNewPost() {
        setTopicDrawer(true)
    }

    return (
        <div className="container-global min-h-screen relative">
            {topicList.length ? <TopicList className="pt-16" TopicList={topicList}/> :
                <ul className="pt-16">
                    {
                        Array.from({length: randomNum(1, 10)}).map((_, i) => (
                            <Skeleton key={i} className="w-full h-20 mt-2 rounded-md"/>
                        ))
                    }
                </ul>
            }

            {isLogin &&
                <Button onClick={handleNewPost}
                        className="bg-primary hover:opacity-70 rounded-full h-16 w-16 transition-all absolute shadow-xl bottom-4 right-4 sm:right-6 lg:right-8">
                    <EditIcon/>
                </Button>}

            <CreateTopicDrawer topicDrawer={topicDrawer} setTopicDrawer={setTopicDrawer}/>
        </div>
    );
}

export default Index;
