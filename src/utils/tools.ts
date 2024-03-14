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

const anonymousSubstitutions = [
    'Alice',
    'Bob',
    'Carol',
    'Dave',
    'Eve',
    'Frank',
    'Grace',
    'Heidi',
    'Ivan',
    'Judy',
    'Mallory',
    'Oscar',
    'Peggy',
    'Trent',
    'Walter',
    'Wendy',
    'Victor',
    'Vincent',
    'Zoe',
] as const

export function getAnonymousSub(index: number) {
    const sub = anonymousSubstitutions[index % anonymousSubstitutions.length]
    if (index < anonymousSubstitutions.length) {
        return sub
    }
    return sub + Math.floor(index / anonymousSubstitutions.length)
}

export function handleLink(content: string): { __html: string } {
    const reg = /#(\d+)/g
    return {__html: content.replace(reg, `<a href="/topic/$1" class="text-primary hover:underline">$&</a>`)}
}
