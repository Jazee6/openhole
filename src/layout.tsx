import Header from "./components/header.tsx";
import Footer from "./components/footer.tsx";
import {router} from "./routes.tsx";
import {RouterProvider} from "react-router-dom";
import {LoginModal} from "./components/login.tsx";
import {Toaster} from "react-hot-toast";
import {useEffect} from "react";

function Layout() {
    useEffect(() => {
        const recaptcha = document.createElement('script')
        recaptcha.src = "https://www.recaptcha.net/recaptcha/api.js?render=" + import.meta.env.VITE_RECAPTCHA
        recaptcha.async = true
        document.head.appendChild(recaptcha)

        return () => {
            document.head.removeChild(recaptcha)
        }
    }, []);

    return (
        <main>
            <Header/>
            <RouterProvider router={router}/>
            <Footer className={"fixed bottom-1 left-1/2 -translate-x-1/2"}/>

            <Toaster/>
            <LoginModal/>
        </main>
    );
}

export default Layout;
