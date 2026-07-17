import { prisma } from "../../infrastructure/prisma";
import { generatePayHereHash, verifyPayHereWebhook, getPayHereCheckoutUrl } from "../../utils/payhere.util";

export async function createCheckoutSession(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const currency = user.currencyPreference || "LKR";
  const amount = currency === "LKR" ? 200.0 : 0.99;

  const orderId = `CHITHIRA-${userId}-${Date.now()}`;

  await prisma.payment.create({
    data: {
      userId,
      orderId,
      amount,
      currency,
      status: "PENDING",
    },
  });

  const hash = generatePayHereHash(orderId, amount, currency);

  const checkoutPayload = {
    merchant_id: process.env.PAYHERE_MERCHANT_ID,
    return_url: `${process.env.APP_URL || "http://localhost:3000"}/dashboard?payment=success`,
    cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/dashboard?payment=cancel`,
    notify_url: `${process.env.API_URL || "http://localhost:5000"}/api/v1/subscription/webhook`,
    order_id: orderId,
    items: "Chithira Pro Monthly Subscription",
    amount: amount.toFixed(2),
    currency,
    hash,
    first_name: user.username || "User",
    last_name: "",
    email: user.email,
    phone: "",
    address: "",
    city: "",
    country: "Sri Lanka",
    custom_1: userId,
  };

  return {
    checkoutUrl: getPayHereCheckoutUrl(),
    payload: checkoutPayload,
  };
}

export async function handlePayHereWebhook(body: Record<string, string>) {
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig, payment_id, method, custom_1 } =
    body;

  const isValid = verifyPayHereWebhook(merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig);
  if (!isValid) {
    throw new Error("Invalid webhook signature");
  }

  if (status_code === "2") {
    await prisma.payment.update({
      where: { orderId: order_id },
      data: { status: "SUCCESS", paymentId: payment_id, method },
    });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await prisma.user.update({
      where: { id: custom_1 },
      data: { subscriptionTier: "PRO", subscriptionExpiry: expiryDate },
    });

    return { success: true, message: "User upgraded to PRO" };
  } else {
    await prisma.payment.update({
      where: { orderId: order_id },
      data: { status: "FAILED" },
    });
    return { success: false, message: "Payment failed" };
  }
}

export async function getSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const now = new Date();
  const trialDaysLeft = user.trialStartDate
    ? Math.max(0, 7 - Math.floor((now.getTime() - user.trialStartDate.getTime()) / 86400000))
    : 7;

  const isExpired = user.subscriptionExpiry ? user.subscriptionExpiry < now : false;
  const effectiveTier = isExpired ? "FREE" : user.subscriptionTier;

  return {
    tier: effectiveTier,
    isPro: effectiveTier === "PRO",
    subscriptionExpiry: user.subscriptionExpiry,
    trialDaysLeft: user.subscriptionTier === "FREE" ? trialDaysLeft : 0,
    currencyPreference: user.currencyPreference,
  };
}

export async function setTrialStartDate(userId: string) {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 7 * 86400000);

  await prisma.user.update({
    where: { id: userId },
    data: { trialStartDate: now, subscriptionExpiry: expiryDate },
  });
}

export async function cancelSubscription(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionExpiry: new Date() },
  });
}
