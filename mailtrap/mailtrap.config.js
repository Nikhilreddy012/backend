import { MailtrapClient } from "mailtrap"
import dotenv from "dotenv"

dotenv.config()

export const mailTrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_API_KEY,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Nikhil",
};


