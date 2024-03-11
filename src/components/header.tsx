import {AccountIcon, IButton, LoginIcon} from "./icons.tsx";
import {router} from "../routes.tsx";
import {useGlobalStore} from "@/store";

function Header() {
    const isLogin = useGlobalStore((state) => state.isLogin)
    const setLoginModal = useGlobalStore((state) => state.setLoginModal)

    async function handleAccount() {
        await router.navigate('/account')
    }

    return (
        <header className={"fixed w-full h-16 shadow blur-global rounded-b-xl z-10"}>
            <div className={'container-global flex items-center h-full'}>
                <a href={'/'} className={'text-primary font-bold'}>OpenHole</a>
                {isLogin ? <IButton className={"ml-auto"} onClick={handleAccount}
                    ><AccountIcon/></IButton> :
                    <IButton className={"ml-auto"} onClick={() => setLoginModal(true)}><LoginIcon/></IButton>}
            </div>
        </header>
    );
}

export default Header;
