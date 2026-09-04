import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async ({ to, subject, html }) => {
    await brevo.transactionalEmails.sendTransacEmail({
        sender: {
            email: process.env.EMAIL_USER,
            name: process.env.EMAIL_NAME || "Your App",
        },

        to: [
            {
                email: to,
            },
        ],

        subject,
        htmlContent: html,
    });
};

export { sendEmail };

/*const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP CONNECTION FAILED:", error);
    } else {
        console.log("SMTP SERVER IS READY");
    }
});

const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("MESSAGE ID:", info.messageId);
    console.log("ACCEPTED:", info.accepted);
    console.log("REJECTED:", info.rejected);
    console.log("RESPONSE:", info.response);

    return info;
};

export { transporter, sendEmail };*/