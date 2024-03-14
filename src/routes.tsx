import {createBrowserRouter} from "react-router-dom";
import Index from "./pages";
import {NotFound} from "@/components/others.tsx";
import Account from "@/pages/account.tsx";
import Detail from "@/pages/detail.tsx";
import {useGlobalStore} from "@/store";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Index/>,
    },
    {
        path: "/login",
        element: <Index/>,
        loader: async () => {
            useGlobalStore.getState().setLoginModal(true)
            return null
        }
    },
    {
        path: "/register",
        element: <Index/>,
        loader: async () => {
            useGlobalStore.getState().setLoginModal(false)
            return null
        }
    },
    {
        path: "/account",
        element: <Account/>
    },
    {
        path: "/topic/:id",
        element: <Detail/>,
        loader: async ({params}) => {
            if (params.id) {
                return parseInt(params.id)
            }
            return null
        }
    },
    {
        path: "*",
        element: <NotFound/>
    }
])
