import {create} from "zustand";
import {TopicCard} from "../components/topic.tsx";
import {isLogin} from "@/utils/tools.ts";

interface TopicListState {
    topicList: TopicCard[];
    setTopicList: (topicList: TopicCard[]) => void;
    setTopicStar: (topicId: number, star: number) => void;
    setTopicUnStar: (topicId: number, star: number) => void;
}

export const useTopicListStore = create<TopicListState>((set) => ({
    topicList: [],
    setTopicList: (topicList) => set({topicList}),
    setTopicStar: (topicId, star) => set((state) => ({
        topicList: state.topicList.map((topic) => {
            if (topic.id === topicId) {
                return {
                    ...topic,
                    starred: topicId,
                    star: star + 1,
                }
            }
            return topic
        })
    })),
    setTopicUnStar: (topicId, star) => set((state) => ({
        topicList: state.topicList.map((topic) => {
            if (topic.id === topicId) {
                return {
                    ...topic,
                    starred: null,
                    star: star - 1,
                }
            }
            return topic
        })
    }))
}))

interface GlobalState {
    isLogin: boolean;
    setIsLogin: (isLogin: boolean) => void;
    loginModal: boolean;
    setLoginModal: (loginModal: boolean) => void;
    reload: boolean;
    setReload: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
    isLogin: isLogin(),
    setIsLogin: (isLogin) => set({isLogin}),
    loginModal: false,
    setLoginModal: (loginModal) => set({loginModal}),
    reload: false,
    setReload: () => set(state => ({reload: !state.reload})),
}))
