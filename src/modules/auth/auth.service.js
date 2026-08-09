import {NotFoundError, UnauthenticatedError} from "../../lib/error-definitions.js";
import {generateAuthenticationToken} from "../../app/providers/jwt.provider.js";
import argon from 'argon2';
import * as userService from './user.service.js';

export const registerUser = async(payload) => {
    await userService.createUser(payload);
};

export const authenticateUser = async (payload) => 
{
    const user = await userService.getUserByEmail(payload.email);

    if(!user) throw new NotFoundError('we could not validate your credentials, please try again');

    if(!(await argon.verify(user.password, payload.password))) throw new UnauthenticatedError('we could not validate your credentials, please try again');

    //create the token and set it in the cookie

    return generateAuthenticationToken({
        id: user.id,
        email: user.email,
        role: user.role,

    });

}