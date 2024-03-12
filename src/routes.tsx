import {createBrowserRouter} from "react-router-dom";
import Index from "./pages";
import {NotFound} from "@/components/others.tsx";
import Account from "@/pages/account.tsx";
import Detail from "@/pages/detail.tsx";
import {getComments, getTopicListReq} from "@/api";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Index/>
    },
    {
        path: "/account",
        element: <Account/>
    },
    {
        path: "/topic/:id",
        element: <Detail/>,
        loader: async ({params}) => {
            return await getComments({topic_id: parseInt(params.id as string), limit: 10, offset: 0})
        },
        errorElement: <NotFound/>
    },
    {
        path: "*",
        element: <NotFound/>
    }
])
