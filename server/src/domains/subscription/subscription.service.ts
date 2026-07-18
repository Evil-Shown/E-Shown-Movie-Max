import { prisma } from "../../infrastructure/prisma";
import { generatePayHereHash, verifyPayHereWebhook, getPayHereCheckoutUrl } from "../../utils/payhere.util";
import { env } from "../../config/env";
import { z } from "zod";

const PRICING = { LKR: 200.0, USD: 0.99 } as const;
const SUBSCRIPTION_DURATION_DAYS = 30;

const WEBHOOK_BODY_SCHEMA = z.object({
  merchant_id: z.string().min(1),
  order_id: z.string().min(1),
  payhere_amount: z.string().min(1),
  payhere_currency: z.string().min(1).toUpperCase(),
  status_code: z.string().min(1),
  md5sig: z.string().min(1),
  payment_id: z.string().optional(),
  method: z.string().optional(),
  custom_1: z.string().optional(),
});

export async function createCheckoutSession(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const currency = user.currencyPreference === "USD" ? "USD" : "LKR";
  const amount = PRICING[currency];

  const orderId = `CHITHIRA-${userId}-${Date.now()}`;

  await prisma.payment.create({
    data: { userId, orderId, amount, currency, status: "PENDING" },
  });

  const hash = generatePayHereHash(orderId, amount, currency);

  const checkoutPayload: Record<string, string> = {
    merchant_id: env.PAYHERE_MERCHANT_ID,
    return_url: `${env.APP_URL}/dashboard?payment=success`,
    cancel_url: `${env.APP_URL}/dashboard?payment=cancel`,
    notify_url: `${env.API_URL}/api/v1/subscription/webhook`,
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

    // PayHere recurring billing parameters
    recurrence: "1 Month",
    duration: "Forever",
    startup_fee: amount.toFixed(2),
  };

  return {
    checkoutUrl: getPayHereCheckoutUrl(),
    payload: checkoutPayload,
  };
}

export async function handlePayHereWebhook(rawBody: Record<string, unknown>) {
  const parsed = WEBHOOK_BODY_SCHEMA.safeParse(rawBody);
  if (!parsed.success) {
    throw new Error(`Invalid webhook body: ${parsed.error.message}`);
  }

  const body = parsed.data;

  const isValid = verifyPayHereWebhook(
    body.order_id,
    body.payhere_amount,
    body.payhere_currency,
    body.status_code,
    body.md5sig
  );
  if (!isValid) {
    throw new Error("Invalid webhook signature");
  }

  const payment = await prisma.payment.findUnique({ where: { orderId: body.order_id } });
  if (!payment) {
    throw new Error(`Payment not found for order_id: ${body.order_id}`);
  }

  if (payment.status !== "PENDING") {
    return { success: true, message: "Webhook already processed" };
  }

  // Validate against the persisted payment record, not current global pricing
  const receivedCurrency = body.payhere_currency;
  if (receivedCurrency !== payment.currency) {
    throw new Error(`Currency mismatch: payment record has ${payment.currency}, webhook reports ${receivedCurrency}`);
  }

  const receivedAmount = Number.parseFloat(body.payhere_amount);
  const expectedAmount = payment.amount;
  if (Number.isNaN(receivedAmount) || Math.abs(receivedAmount - expectedAmount) > 0.01) {
    throw new Error(`Amount mismatch: payment record has ${expectedAmount}, webhook reports ${receivedAmount}`);
  }

  if (body.status_code === "2") {
    return await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: body.order_id },
        data: { status: "SUCCESS", paymentId: body.payment_id, method: body.method },
      });

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + SUBSCRIPTION_DURATION_DAYS);

      await tx.user.update({
        where: { id: payment.userId },
        data: { subscriptionTier: "PRO", subscriptionExpiry: expiryDate },
      });

      return { success: true, message: "User upgraded to PRO" };
    });
  }

  await prisma.payment.update({
    where: { orderId: body.order_id },
    data: { status: "FAILED" },
  });

  return { success: false, message: "Payment failed" };
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
    data: { subscriptionTier: "FREE", subscriptionExpiry: new Date() },
  });
}
