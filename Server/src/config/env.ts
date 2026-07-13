function getEnv(key:string):string{
    const value = process.env[key]
    if(!value){
        throw new Error(`required environment variables ${key} is not configured`)
    }
    return value
}

export const env = {
    PORT: process.env.PORT || '5000',
    MONGO_URI: getEnv('MONGO_URI'),
    FRONTEND_URL : getEnv('FRONTEND_URL'),
    ACCESS_TOKEN_SECRET: getEnv('ACCESS_TOKEN_SECRET'),
    REFRESH_TOKEN_SECRET: getEnv('REFRESH_TOKEN_SECRET'),
    ACCESS_TOKEN_EXPIRY: getEnv('ACCESS_TOKEN_EXPIRY'),
    REFRESH_TOKEN_EXPIRY: getEnv('REFRESH_TOKEN_EXPIRY'),
    REFRESH_TOKEN_COOKIE_MAX_AGE: Number(getEnv('REFRESH_TOKEN_COOKIE_MAX_AGE')),
    COOKIE_SECURE: getEnv('COOKIE_SECURE') === 'true',
    COOKIE_SAME_SITE: getEnv('COOKIE_SAME_SITE') as 'lax' | 'strict' | 'none',
}