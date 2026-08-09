import jwt from "jsonwebtoken";
import config from "../../config/app.config.js";

export const generateAuthenticationToken = (payload) => {
    return jwt.sign(payload, config.jwt.secret, {expiresIn: `${config.jwt.expiration}s`});
};

export const verifyAuthenticationToken = (token) => {
    return jwt.verify(token, config.jwt.secret);
};