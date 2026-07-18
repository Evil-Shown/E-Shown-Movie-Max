import crypto from "crypto";
import { env } from "../config/env";

const merchantId = env.PAYHERE_MERCHANT_ID;
const merchantSecret = env.PAYHERE_SECRET;
const apiUrl = env.PAYHERE_API_URL;

function hashSecret(): string {
  return crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
}

export function generatePayHereHash(orderId: string, amount: number, currency: string) {
  const formattedAmount = Number(amount).toFixed(2);
  const formattedSecret = hashSecret();
  const hashString = merchantId + orderId + formattedAmount + currency.toUpperCase() + formattedSecret;
  return crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();
}

export function verifyPayHereWebhook(
  orderId: string,
  payhereAmount: string,
  payhereCurrency: string,
  statusCode: string,
  md5sig: string
) {
  const formattedSecret = hashSecret();
  const localHashString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + formattedSecret;
  const localMd5sig = crypto.createHash("md5").update(localHashString).digest("hex").toUpperCase();
  return localMd5sig === md5sig;
}

export function getPayHereCheckoutUrl() {
  return `${apiUrl}/pay/checkout`;
}
