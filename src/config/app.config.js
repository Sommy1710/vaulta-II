import {config} from "dotenv"
config()

/*export default{
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    db: {
        development: process.env.STAGING_MONGODB_URI,
        test: process.env.TEST_MONGODB_URI,
        production: process.env.MONGODB_URI,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiration: process.env.JWT_EXPIRES_IN
    },
    swagger: {
        swagger_url: process.env.SWAGGER_SERVER_URL
    },
}*/


export default {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || "development",

    db: {
        url: process.env.DATABASE_URL
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiration: process.env.JWT_EXPIRES_IN
    },

    swagger: {
        swagger_url: process.env.SWAGGER_SERVER_URL
    }
};
