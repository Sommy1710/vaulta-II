import { asyncHandler } from "../../lib/util.js";
import { Validator } from "../../lib/validator.js";
import { ValidationError } from "../../lib/error-definitions.js";
import { SendMessageRequest } from "./send.message.request.js";
import {prisma} from "../../config/db.prisma.js";
import {io} from "../../bootstrap/server.js";

export const sendMessage = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const validator = new Validator();

    const { errors, value } = validator.validate(
        SendMessageRequest,
        req.body
    );

    if (errors) {
        throw new ValidationError(
            "Validation failed",
            errors
        );
    }

    // Find user's open conversation
    let conversation =
        await prisma.conversation.findFirst({
            where: {
                userId,
                status: "OPEN",
            },
        });

    // Create one if it doesn't exist
    if (!conversation) {
        conversation =
            await prisma.conversation.create({
                data: {
                    userId,
                },
            });
    }

    const message =
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderType: "USER",
                message: value.message,
            },
        });
        io.to(`conversation:${conversation.id}`).emit(
          "newMessage",
          message
        );
    return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
    });
});


export const getMyMessages = asyncHandler(async (req, res) => {

    const userId = req.user.id;

    const conversation =
        await prisma.conversation.findFirst({
            where: {
                userId,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

    return res.status(200).json({
        success: true,
        data: conversation,
    });
});