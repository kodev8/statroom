import mailer from '~/constants/mailer';
import fs from 'fs';
import logger from '~/middleware/winston';

export type TMailAttachment = {
    filename: string;
    path: string;
    cid: string;
};

const sendMail = async (
    recipient: string,
    subject: string,
    replace: Record<string, any>,
    template: string,
    attachments?: TMailAttachment[]
): Promise<void> => {
    // const mailer = nodemailer.createTransport({
    //     host: "smtp.ethereal.email",
    //     port: 587,
    //     secure: false,
    //     auth: {
    //         user: testAccount.user,
    //         pass: testAccount.pass
    //     }

    // })

    // check if template exists
    if (!fs.existsSync(`./mail/templates/${template}.html`)) {
        logger.error(`Template ${template} not found`);
        throw new Error('Template not found');
    }

    let html = fs.readFileSync(`./mail/templates/${template}.html`, 'utf8');

    html = html.replace(/{{(\w+)}}/g, (match, key) => {
        return replace[key] || match;
    });

    const info = await mailer.sendMail({
        from: '"Statroom AI"',
        to: recipient,
        subject,
        attachments,
        html,
    });
    logger.info(`${info.messageId} sent`);
};

export default sendMail;
