import {getToken, isLogin, setToken} from "@/utils/tools.ts";
import toast from "react-hot-toast";

interface JsonRes {
    message?: string
    data?: unknown
}

async function basicFetch(
    url: string,
    options: RequestInit = {}
) {
    const headers = new Headers(options.headers || {});
    if (isLogin()) {
        headers.set('Authorization', getToken()!);
    }

    const response = await fetch(import.meta.env.VITE_API_URL + url, {
        ...options,
        headers,
    });

    if (response.ok) {
        const res = await response.json() as JsonRes
        if (res.message) {
            toast.success(res.message)
        }
        const token = response.headers.get('Authorization')
        if (token) {
            setToken(token)
        }
        return res;
    } else {
        if (response.status === 401) {
            // const setLoginModal = useGlobalStore.getState().setLoginModal
            // setLoginModal(true)
            toast.error("请先登录")
            throw new Error("Please login first")
        }

        const contentType = response.headers.get("Content-Type")
        if (contentType && contentType.includes("text/plain")) {
            const errMsg = await response.text()
            toast.error(errMsg)
            throw new Error(errMsg)
        }
        toast.error(response.statusText)
        throw new Error(response.statusText)
    }
}

export function postFetch(url: string, body: URLSearchParams) {
    return basicFetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });
}

export async function postFetchWithRecaptcha(url: string, body: URLSearchParams) {
    return basicFetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Recaptcha": await getRecaptchaToken(),
        },
        body,
    });
}

export function getFetch(url: string, queryParams?: URLSearchParams) {
    if (queryParams) {
        url += "?" + queryParams.toString()
    }
    return basicFetch(url);
}

export function getRecaptchaToken() {
    return new Promise<string>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        grecaptcha.ready(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            grecaptcha.execute(import.meta.env.VITE_RECAPTCHA, {action: 'submit'}).then(resolve)
        })
    })
}
