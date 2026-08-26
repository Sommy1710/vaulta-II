import {UnauthenticatedError} from "../../lib/error-definitions.js";
import { verifyAuthenticationToken } from "../providers/jwt.provider.js";
import { getBearerToken } from "../../lib/util.js";

export default function authMiddleware(req, res, next) {
    try {
        const token = getBearerToken(req);
    const decoded = verifyAuthenticationToken(token);
    req.user = decoded;
    next();
    } catch (error) {
        throw new UnauthenticatedError('invalid or missing token');
    }
}

export const permit = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.decoded?.role || req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'You are not authorized to perform this operation' });
    }
    next();
  };
};