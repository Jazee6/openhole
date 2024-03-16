import {useGlobalStore} from "@/store";
import {router} from "@/routes.tsx";
import {AccountIcon, IButton, LoadingIcon, LoginIcon} from "@/components/icons.tsx";
import clsx from "clsx";
import {version} from "../../package.json";
import {isLogin} from "@/utils/tools.ts";
import {Button} from "@/components/ui/button.tsx";

export function NotFound() {
    return (
        <div className="h-screen flex items-center justify-center">
            <h1 className="font-bold text-3xl text-primary">404 Not Found</h1>
        </div>
    );
}

export function Header() {
    const setLoginModal = useGlobalStore((state) => state.setLoginModal)

    async function handleAccount() {
        await router.navigate('/account')
    }

    return (
        <header className={"fixed w-full h-16 shadow blur-global rounded-b-xl z-10"}>
            <div className={'container-global flex items-center h-full'}>
                <a href={'/'} className={'text-primary font-bold'}>OpenHole</a>
                {isLogin() ? <IButton className={"ml-auto"} onClick={handleAccount}
                    ><AccountIcon/></IButton> :
                    <IButton className={"ml-auto"} onClick={() => setLoginModal(true)}><LoginIcon/></IButton>}
            </div>
        </header>
    );
}

export function Footer({className}: { className?: string }) {
    return (
        <footer className={clsx(className, "text-xs font-light")}>
            V{version} | Star on <a target="_blank" className={"underline"}
                                    href={"https://github.com/Jazee6/openhole"}>Github</a>
        </footer>
    )
}

export function LoadMore() {
    return (
        <div id="load-more" className="h-16 w-full flex justify-center">
            <LoadingIcon className="h-full animate-spin"/>
        </div>
    );
}

export function Deny() {

    return (
        <div className="h-screen flex flex-col items-center justify-center space-y-4 p-4">
            <h1 className="font-bold text-3xl text-primary">很抱歉，我们不在您所在的地区提供服务🥲</h1>
            <Button onClick={async () => await router.navigate(-1)}>返回</Button>
        </div>
    );
}
