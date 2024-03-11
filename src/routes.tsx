import {createBrowserRouter} from "react-router-dom";
import Index from "./pages";
import {NotFound} from "@/components/others.tsx";
import Account from "@/pages/account.tsx";
import Detail from "@/pages/detail.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Index/>,
    },
    {
        path: "/account",
        element: <Account/>
    },
    {
        path: "/topic/:id",
        element: <Detail/>,
        //loader useloaderdata
    },
    {
        path: "*",
        element: <NotFound/>
    }
])
