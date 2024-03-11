import {getToken, isLogin, setToken} from "@/utils/tools.ts";
import toast from "react-hot-toast";

interface JsonRes {
    message?: string
    data?: {
        token?: string
    }
}

async function basicFetch(
    url: string,
    options: RequestInit = {}
) {
    const headers = new Headers(options.headers || {});
    if (isLogin()) {
        headers.set('Authorization', `Bearer ${getToken()}`);
    }

    const response = await fetch(import.meta.env.VITE_API_URL + url, {
        ...options,
        headers,
    });

    if (response.ok) {
        const res = await response.json() as JsonRes
        if (res.data?.token) {
            setToken(res.data.token)
        }
        return res;
    } else {
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

export function getFetch(url: string, queryParams: URLSearchParams) {
    return basicFetch(url + "?" + queryParams.toString());
}
