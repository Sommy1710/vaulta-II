import mongoose, {model, Schema} from 'mongoose';

import argon from 'argon2'

const UserSchema = new Schema ({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    isEmailVerified: {type: Boolean, default: false},
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    emailVerificationCode: String,
    emailCodeExpiry: Date,

    passwordResetCode: String,
    passwordResetExpiry: Date,

    isDeleted: {type: Boolean, default: false},
    deleteRequestedAt: Date,
}, {timestamps: true});

UserSchema.pre('save', async function()
{
    if (this.isModified('password'))
    {
        this.password = await argon.hash(this.password);
    }
});
 
export const User = model('User', UserSchema);


