import Header from "./components/header.tsx";
import Footer from "./components/footer.tsx";
import {router} from "./routes.tsx";
import {RouterProvider} from "react-router-dom";
import {LoginModal} from "./components/login.tsx";
import {Toaster} from "react-hot-toast";

function Layout() {
    return (
        <main className={"h-full"}>
            <Header/>
            <RouterProvider router={router}/>
            <Footer className={"absolute bottom-1 left-1/2 -translate-x-1/2"}/>

            <Toaster/>
            <LoginModal/>
        </main>
    );
}

export default Layout;
