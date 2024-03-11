const TOKEN_KEY = 'oh_token'

export function randomNum(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const isLogin = () => {
    return !!localStorage.getItem(TOKEN_KEY)
}

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
}

export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
}
