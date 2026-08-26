import {UnauthenticatedError} from "../../lib/error-definitions.js";
import { verifyAuthenticationToken } from "../providers/jwt.provider.js";
import { getBearerToken } from "../../lib/util.js";

export default function adminMiddleware(req, res, next) {
    try {
        const token = getBearerToken(req);
    const decoded = verifyAuthenticationToken(token);
    req.admin = decoded;
    next();
    } catch (error) {
        throw new UnauthenticatedError('invalid or missing token');
    }
}