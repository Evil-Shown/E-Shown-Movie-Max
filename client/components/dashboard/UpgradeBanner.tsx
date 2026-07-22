"use client";

import { useState } from "react";
import styles from "./UpgradeBanner.module.css";

const FEATURES = [
  "Live TV & ad-free streaming",
  "The God's Eye",
  "Offline downloads",
] as const;

export default function UpgradeBanner({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const isMonthly = billing === "monthly";

  const price = isMonthly ? "200" : "2,000";
  const was = isMonthly ? "500" : "2,400";
  const savings = isMonthly ? "60%" : "17%";
  const perDay = isMonthly ? "LKR 6.67 / day" : "LKR 5.48 / day";
  const usd = isMonthly ? "$0.99 / mo worldwide" : "$9.90 / yr worldwide";

  return (
    <section className={styles.banner} aria-labelledby="pro-banner-title">
      <div className={styles.glow} aria-hidden />
      <div className={styles.grain} aria-hidden />

      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.star} aria-hidden>
              ★
            </span>
            Chithira Pro
          </p>
          <h2 id="pro-banner-title" className={styles.title}>
            Unlock Live TV &amp; The God&apos;s Eye
          </h2>
          <p className={styles.lead}>
            Keep streaming after the trial — ad-free cinema, downloads, and full Live TV access.
          </p>

          <ul className={styles.features}>
            {FEATURES.map((feat) => (
              <li key={feat} className={styles.feature}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.offer}>
          <div className={styles.billing} role="group" aria-label="Billing period">
            <button
              type="button"
              className={`${styles.billingBtn} ${isMonthly ? styles.billingBtnActive : ""}`}
              onClick={() => setBilling("monthly")}
              aria-pressed={isMonthly}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`${styles.billingBtn} ${!isMonthly ? styles.billingBtnActive : ""}`}
              onClick={() => setBilling("yearly")}
              aria-pressed={!isMonthly}
            >
              Yearly
            </button>
          </div>

          <div className={styles.priceBlock}>
            <p className={styles.saveChip}>Save {savings}</p>
            <div className={styles.priceRow}>
              <span className={styles.was}>LKR {was}</span>
              <span className={styles.price}>
                LKR {price}
                <span className={styles.period}>{isMonthly ? "/mo" : "/yr"}</span>
              </span>
            </div>
            <p className={styles.meta}>
              {perDay} · Cancel anytime
              <span className={styles.metaUsd}>{usd}</span>
            </p>
          </div>

          <button type="button" onClick={onUpgradeClick} className={styles.cta}>
            Upgrade to Pro
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
