import dotenv from "dotenv";
import { Command } from "commander";

const program = new Command();

program.option('--mode <mode>', 'mode en que se levantara la app', 'dev')

program.parse()

const mode = program.opts().mode 

dotenv.config({
  path: mode == 'dev' ? '.env.development' : '.env.production'
})

console.log(program.opts())

export default {
  // Entorno:
  ENVIRONMENT: process.env.ENVIRONMENT,
  // MongoDB:
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
  // ADMIN:
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  // GitHub:
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
  // JWT:
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_COOKIE: process.env.JWT_COOKIE,
  JWT_USER: process.env.JWT_USER,
  // Firma Cookies:
  FIRMA_COOKIE: process.env.FIRMA_COOKIE,
  // Nodemailer:
  SERVICE_TRANSPORT: process.env.SERVICE_TRANSPORT,
  PORT_TRANSPORT: process.env.PORT_TRANSPORT,
  AUTH_USER_TRANSPORT: process.env.AUTH_USER_TRANSPORT,
  AUTH_PASS_TRANSPORT: process.env.AUTH_PASS_TRANSPORT,
  // Token Request Pass
  RESET_PASSWORD_TOKEN: process.env.RESET_PASSWORD_TOKEN,
  RESET_PASSWORD_COOKIE: process.env.RESET_PASSWORD_COOKIE,
  // Keys Stripe:
  STRIPE_KEY_PUBLIC: process.env.STRIPE_KEY_PUBLIC,
  STRIPE_KEY_SECRET: process.env.STRIPE_KEY_SECRET,
  // Purchase Order
  PURCHASE_ORDER: process.env.PURCHASE_ORDER
}
