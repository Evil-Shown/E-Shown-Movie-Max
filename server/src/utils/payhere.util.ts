import crypto from "crypto";

const merchantId = process.env.PAYHERE_MERCHANT_ID || "";
const merchantSecret = process.env.PAYHERE_SECRET || "";
const apiUrl = process.env.PAYHERE_API_URL || "https://sandbox.payhere.lk";

export function generatePayHereHash(orderId: string, amount: number, currency: string) {
  const formattedAmount = Number(amount).toFixed(2).replaceAll(",", "").replaceAll(".", "");
  const formattedSecret = merchantSecret.replaceAll("-", "");
  const hashString = merchantId + orderId + formattedAmount + currency.toUpperCase() + formattedSecret;
  return crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();
}

export function verifyPayHereWebhook(
  merchantId: string,
  orderId: string,
  payhereAmount: string,
  payhereCurrency: string,
  statusCode: string,
  md5sig: string
) {
  const formattedSecret = merchantSecret.replaceAll("-", "");
  const localHashString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + formattedSecret;
  const localMd5sig = crypto.createHash("md5").update(localHashString).digest("hex").toUpperCase();
  return localMd5sig === md5sig;
}

export function getPayHereCheckoutUrl() {
  return `${apiUrl}/pay/checkout`;
}
