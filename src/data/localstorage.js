export const setToken = (token)=>{
    localStorage.zy_token = token
}

export const getToken = ()=>{
    return localStorage.zy_token
}