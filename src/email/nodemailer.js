import nodemailer from 'nodemailer';
import config from "../config.js";

export default class Mail {
    constructor() {
        this.transport = nodemailer.createTransport({
            service: config.SERVICE_TRANSPORT,
            port: config.PORT_TRANSPORT,
            auth: {
                user: config.AUTH_USER_TRANSPORT,
                pass: config.AUTH_PASS_TRANSPORT,
            }
        })
    };
    async sendMail(email, subject, html) {
        let result = await this.transport.sendMail({
            from: config.AUTH_USER_TRANSPORT,
            to: email,
            subject,
            html
        });
        return result;
    };
};