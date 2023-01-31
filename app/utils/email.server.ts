// eslint-disable-next-line import/no-extraneous-dependencies
import formData from "form-data";
import Mailgun from "mailgun.js";
import type { MailgunMessageData } from "mailgun.js/interfaces/Messages";

export interface IMailgunMessage {
  toName: string;
  fromName: string;
  email: string;
  message?: string;
  subject: string;
  template: string;
  variables: { [key: string]: string };
  version?: string;
}

export async function sendEmail({
  toName,
  fromName,
  email,
  message,
  subject,
  template,
  variables,
  version,
}: IMailgunMessage) {
  let DOMAIN = "DOMAIN_EXAMPLE";
  let API_KEY = "KEY_EXAMPLE";

  if (process.env.MAILGUN_DOMAIN) {
    DOMAIN = process.env.MAILGUN_DOMAIN;
  }
  if (process.env.MAILGUN_API_KEY) {
    API_KEY = process.env.MAILGUN_API_KEY;
  }
  const mg = new Mailgun(formData);
  const mgClient = mg.client({ username: "api", key: API_KEY });
  const data: MailgunMessageData = {
    from: `${fromName} <hello@inhoots.com>`,
    to: `${toName} <${email}>`,
    subject,
    "t:version": version,
    "h:X-Mailgun-Variables": JSON.stringify(variables),
    template,
    message,
  };
  await mgClient.messages.create(DOMAIN, data);
}
