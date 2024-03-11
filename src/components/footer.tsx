import clsx from "clsx";
import {version} from "../../package.json";

export default function Footer({className}: { className?: string }) {
    return (
        <footer className={clsx(className, "text-xs font-light")}>
            V{version} | Star on <a target="_blank" className={"underline"}
                                    href={"https://github.com/Jazee6/openhole"}>Github</a>
        </footer>
    )
}
