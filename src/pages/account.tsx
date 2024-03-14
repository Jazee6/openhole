import {useEffect} from "react";
import {getStarListReq} from "@/api";
import {useTopicListStore} from "@/store";
import {TopicList} from "../components/topic.tsx";
import {TopicCardType} from "@/utils/types.ts";
import {randomNum} from "@/utils/tools.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";

function Account() {
    const topicList = useTopicListStore((state) => state.topicList)
    const setTopicList = useTopicListStore((state) => state.setTopicList)

    useEffect(() => {
        getStarListReq({limit: 10, offset: 0}).then((res) => {
            setTopicList(res.data as TopicCardType[])
        })
    }, [setTopicList]);

    return (
        <div className="container-global flex flex-col pt-24">
            <h2 className="font-bold text-2xl">Your Stars</h2>
            {topicList.length ? <TopicList className="pt-4" TopicList={topicList}/> :
                <ul className="pt-4">
                    {
                        Array.from({length: randomNum(1, 10)}).map((_, i) => (
                            <Skeleton key={i} className="w-full h-20 mt-2 rounded-md bg-card"/>
                        ))
                    }
                </ul>
            }
        </div>
    );
}

export default Account;
