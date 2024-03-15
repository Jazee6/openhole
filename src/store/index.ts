import {create} from "zustand";
import {isLogin} from "@/utils/tools.ts";
import {TopicCardType} from "@/utils/types.ts";

interface TopicListState {
    topicList: TopicCardType[];
    setTopicList: (topicList: TopicCardType[]) => void;
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
    loginModal: boolean;
    setLoginModal: (loginModal: boolean) => void;
    reload: boolean;
    setReload: () => void;
    commentDrawer: boolean;
    commentDrawerData: {
        rootID?: number;
        toID?: number;
    }
    setCommentDrawer: (commentDrawer: boolean) => void;
    setCommentDrawerData: (commentDrawerData: {
        rootID?: number;
        toID?: number;
        toUID?: number;
    }) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
    loginModal: false,
    setLoginModal: (loginModal) => set({loginModal}),
    reload: false,
    setReload: () => set(state => ({reload: !state.reload})),
    commentDrawer: false,
    commentDrawerData: {},
    setCommentDrawer: (commentDrawer) => set({commentDrawer}),
    setCommentDrawerData: (commentDrawerData) => set({commentDrawerData}),
}))
