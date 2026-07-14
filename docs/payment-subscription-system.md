# Payment & Subscription System

## Overview

Chithira Cinema uses **PayHere** (Sri Lanka's leading payment gateway) for payment processing. PayHere charges **zero setup/monthly fees** — only a per-transaction fee (~3.5% + LKR 15). This makes it ideal for bootstrapped startups.

- **Sri Lankan users**: PayHere supports local cards (Visa, Mastercard, Amex) and mobile payment apps (eZ Cash, mCash)
- **Global users**: PayHere accepts international cards and deposits USD-converted amounts to your Sri Lankan bank account in LKR

---

## Pricing Structure

| Plan    | Billing | Sri Lanka (LKR) | Global (USD) | Savings            |
| ------- | ------- | --------------- | ------------ | ------------------ |
| **Pro** | Monthly | LKR 200/mo      | $0.99/mo     | 60% off original   |
| **Pro** | Yearly  | LKR 2,000/yr    | $9.99/yr     | Save LKR 400 / ~$2 |

**Original reference prices** (for strikethrough display):

- LKR 500/mo or $2.49/mo (monthly)
- LKR 2,400/yr or $11.88/yr (yearly)

---

## Database Schema

### User Model (`server/prisma/schema.prisma`)

```prisma
enum SubscriptionTier {
  FREE
  PRO
}

model User {
  id                String             @id @default(cuid())
  // ... existing fields ...
  subscriptionTier  SubscriptionTier   @default(FREE)
  subscriptionExpiry DateTime?
  currencyPreference String            @default("LKR")
  trialStartDate    DateTime?
  payments          Payment[]
}

model Payment {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderId     String   @unique
  amount      Float
  currency    String
  status      String   @default("PENDING") // PENDING | SUCCESS | FAILED
  paymentId   String?
  method      String?  // VISA, MASTER, etc.
  createdAt   DateTime @default(now())
}
```

---

## API Endpoints

All routes under `/api/v1/subscription` (also mounted at `/api/subscription` for legacy compat).

| Method | Endpoint           | Auth     | Description                                   |
| ------ | ------------------ | -------- | --------------------------------------------- |
| `POST` | `/create-checkout` | Required | Generates PayHere checkout payload + hash     |
| `GET`  | `/status`          | Required | Returns current tier, trial days left, expiry |
| `POST` | `/cancel`          | Required | Immediately expires subscription              |
| `POST` | `/webhook`         | Public   | PayHere payment notification handler          |

### `POST /create-checkout`

Returns a PayHere checkout URL and form payload. The frontend creates a hidden form and submits it:

```typescript
const response = await fetch("/api/v1/subscription/create-checkout", { method: "POST" });
const { data } = await response.json();

const form = document.createElement("form");
form.method = "POST";
form.action = data.checkoutUrl;

for (const key in data.payload) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = key;
  input.value = data.payload[key];
  form.appendChild(input);
}

document.body.appendChild(form);
form.submit();
```

### `GET /status` Response

```json
{
  "success": true,
  "data": {
    "tier": "FREE",
    "isPro": false,
    "subscriptionExpiry": "2025-07-21T00:00:00.000Z",
    "trialDaysLeft": 5,
    "currencyPreference": "LKR"
  }
}
```

---

## Payment Flow

```
User clicks "Upgrade to Pro"
        │
        ▼
Frontend calls POST /api/v1/subscription/create-checkout
        │
        ▼
Backend generates:
  - Unique orderId (CHITHIRA-{userId}-{timestamp})
  - Saves PENDING payment record
  - Calculates MD5 hash
  - Returns checkoutUrl + form payload
        │
        ▼
Frontend submits hidden form → Redirects to PayHere checkout page
        │
        ▼
User enters card details on PayHere's secure page
        │
        ▼
PayHere sends POST /api/v1/subscription/webhook (server-to-server)
        │
        ▼
Backend verifies MD5 signature
  - If valid + status_code === "2" (success):
    → Payment record updated to SUCCESS
    → User upgraded to PRO + 30 days added
  - If failed:
    → Payment marked as FAILED
        │
        ▼
User redirected to /dashboard?payment=success|cancel
```

### Webhook Verification

PayHere sends `application/x-www-form-urlencoded` POST data. The backend:

1. Reconstructs the MD5 hash from: `merchant_id + order_id + payhere_amount + payhere_currency + status_code + merchant_secret`
2. Compares it with the `md5sig` parameter
3. Only upgrades user if signature is valid AND `status_code === "2"`

---

## Trial System

- **Starts**: Automatically on user registration (email/password + OAuth)
- **Duration**: 7 days from `trialStartDate`
- **Expiry**: `subscriptionExpiry` = trialStartDate + 7 days
- **Post-trial**: User is restricted to basic features; Live TV, God's Eye, and Downloads require PRO

### Trial Days Left (Client-Side Calculation)

```typescript
const trialDaysLeft = useMemo(() => {
  if (isPro || !user?.trialStartDate) return 0;
  const trialStart = new Date(user.trialStartDate).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - trialStart) / 86400000);
  return Math.max(0, 7 - elapsed);
}, [isPro, user?.trialStartDate]);
```

---

## Feature Gating

### Client-Side Components

| Component                                              | Purpose                                                                          |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `client/components/dashboard/ProFeatureGate.tsx`       | Wraps children — shows lock screen for free users, renders content for Pro users |
| `client/components/dashboard/TrialCountdownBanner.tsx` | Shows trial days remaining (turns red/urgent at 2 days)                          |
| `client/components/dashboard/UpgradeBanner.tsx`        | Full upgrade CTA banner with pricing and features                                |
| `client/components/dashboard/PricingModal.tsx`         | Side-by-side Free vs Pro comparison with monthly/yearly toggle                   |
| `client/components/dashboard/ProBadge.tsx`             | Golden "Pro Member" badge (shown in sidebar for Pro users)                       |

### Dashboard Behavior

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD LOGIC                       │
│                                                         │
│  if isPro → show nothing (no banners)                   │
│  if trial active → show TrialCountdownBanner            │
│  if trial expired → show UpgradeBanner                  │
│                                                         │
│  Live TV section → wrapped in ProFeatureGate            │
│  Sidebar badge → "Pro Member" (gold) or "Free" (gray)  │
└─────────────────────────────────────────────────────────┘
```

### Gated Features

| Feature              | Free User                  | Pro User                  |
| -------------------- | -------------------------- | ------------------------- |
| Streaming            | 7-day trial only           | Unlimited                 |
| Live TV              | ❌ Locked (upgrade prompt) | ✅ Full access            |
| God's Eye (Torrents) | ❌ Locked                  | ✅ Stream & Download      |
| Offline Downloads    | ❌ Locked                  | ✅ Available              |
| Devices              | 1                          | 4                         |
| Ads                  | Supported                  | Completely ad-free        |
| Early Access         | ❌                         | ✅ New features & content |

---

## PayHere Configuration

### Environment Variables (`server/.env`)

```env
PAYHERE_MERCHANT_ID=your_sandbox_merchant_id
PAYHERE_SECRET=your_sandbox_merchant_secret
PAYHERE_API_URL=https://sandbox.payhere.lk
APP_URL=http://localhost:3000
```

### Getting Credentials

1. Go to [PayHere.lk](https://www.payhere.lk) and create a **free Merchant Account**
2. Navigate to **Settings → Domains & Credentials**
3. Copy your **Merchant ID** and **Merchant Secret**
4. Use sandbox credentials for testing:
   - Sandbox URL: `https://sandbox.payhere.lk`
   - Test cards: https://support.payhere.lk/faq/test-cards

---

## Key Files

### Backend

| File                                                      | Description                                               |
| --------------------------------------------------------- | --------------------------------------------------------- |
| `server/prisma/schema.prisma`                             | SubscriptionTier enum, User fields, Payment model         |
| `server/src/utils/payhere.util.ts`                        | MD5 hash generation, webhook verification                 |
| `server/src/domains/subscription/subscription.service.ts` | Business logic (checkout, webhook, status, cancel, trial) |
| `server/src/domains/subscription/subscription.routes.ts`  | Route definitions                                         |
| `server/src/domains/auth/auth.types.ts`                   | AuthUser type includes subscription fields                |
| `server/src/domains/auth/auth.service.ts`                 | Calls setTrialStartDate on registration                   |

### Client

| File                                                   | Description                                  |
| ------------------------------------------------------ | -------------------------------------------- |
| `client/components/AuthProvider.tsx`                   | AuthUser interface includes subscriptionTier |
| `client/components/dashboard/ProFeatureGate.tsx`       | Pro feature gating wrapper                   |
| `client/components/dashboard/TrialCountdownBanner.tsx` | Trial countdown banner                       |
| `client/components/dashboard/UpgradeBanner.tsx`        | Upgrade CTA banner with pricing              |
| `client/components/dashboard/PricingModal.tsx`         | Pricing comparison modal                     |
| `client/components/dashboard/ProBadge.tsx`             | Pro member badge                             |
| `client/app/dashboard/page.tsx`                        | Dashboard with gating logic                  |

---

## Future Improvements

- [ ] Add PayHere recurring billing support for auto-renewal
- [ ] Add subscription management page in Settings
- [ ] Add email notifications for trial expiring / payment success
- [ ] Add promo code / coupon system
- [ ] Add download history page
- [ ] Add admin dashboard for subscription analytics
