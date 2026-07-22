"use client";

import { useEffect, useId, useState } from "react";
import styles from "./PricingModal.module.css";

const freeFeatures = ["60-day trial access", "1 device at a time", "Ad-supported streaming"];

const freeLocks = ["Offline downloads", "Live TV", "The God's Eye"];

const proFeatures = [
  "Unlimited full streaming",
  "4 devices at once",
  "Completely ad-free",
  "Offline downloads",
  "Full Live TV access",
  "The God's Eye",
  "Early access to new features",
];

export default function PricingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [region, setRegion] = useState<"LKR" | "USD">("LKR");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMonthly = billing === "monthly";
  const price =
    region === "LKR"
      ? isMonthly
        ? "LKR 200"
        : "LKR 2,000"
      : isMonthly
        ? "$0.99"
        : "$9.90";
  const originalPrice =
    region === "LKR"
      ? isMonthly
        ? "LKR 500"
        : "LKR 2,400"
      : isMonthly
        ? "$2.49"
        : "$11.88";
  const perDay =
    region === "LKR"
      ? isMonthly
        ? "LKR 6.67"
        : "LKR 5.48"
      : isMonthly
        ? "$0.03"
        : "$0.03";
  const savings = isMonthly ? "60%" : "17%";

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Chithira Cinema</p>
            <h2 id={titleId} className={styles.headerTitle}>
              Choose your plan
            </h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close pricing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className={styles.controls}>
          <div className={styles.segment} role="group" aria-label="Currency">
            <button
              type="button"
              className={`${styles.segmentBtn} ${region === "LKR" ? styles.segmentBtnActive : ""}`}
              onClick={() => setRegion("LKR")}
              aria-pressed={region === "LKR"}
            >
              Sri Lanka
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${region === "USD" ? styles.segmentBtnActive : ""}`}
              onClick={() => setRegion("USD")}
              aria-pressed={region === "USD"}
            >
              Global
            </button>
          </div>
          <div className={styles.segment} role="group" aria-label="Billing period">
            <button
              type="button"
              className={`${styles.segmentBtn} ${isMonthly ? styles.segmentBtnActive : ""}`}
              onClick={() => setBilling("monthly")}
              aria-pressed={isMonthly}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${!isMonthly ? styles.segmentBtnActive : ""}`}
              onClick={() => setBilling("yearly")}
              aria-pressed={!isMonthly}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className={styles.plans}>
          <article className={`${styles.plan} ${styles.planFree}`}>
            <div className={styles.planTop}>
              <h3 className={styles.planName}>Free</h3>
              <p className={styles.planTag}>Trial experience</p>
            </div>
            <p className={styles.planPrice}>
              {region === "LKR" ? "LKR 0" : "$0"}
              <span>/{isMonthly ? "mo" : "yr"}</span>
            </p>
            <ul className={styles.list}>
              {freeFeatures.map((feat) => (
                <li key={feat}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>
            <ul className={styles.locks}>
              {freeLocks.map((lock) => (
                <li key={lock}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
                  </svg>
                  {lock}
                </li>
              ))}
            </ul>
            <button type="button" className={styles.ghostBtn} disabled>
              Current plan
            </button>
          </article>

          <article className={`${styles.plan} ${styles.planPro}`}>
            <div className={styles.proGlow} aria-hidden />
            <div className={styles.planTop}>
              <span className={styles.recommended}>Recommended</span>
              <h3 className={styles.planNamePro}>Chithira Pro</h3>
              <p className={styles.planTagPro}>Full cinematic access</p>
            </div>

            <div className={styles.proPriceBlock}>
              <span className={styles.save}>Save {savings}</span>
              <div className={styles.proPriceRow}>
                <span className={styles.was}>{originalPrice}</span>
                <span className={styles.proPrice}>
                  {price}
                  <span>/{isMonthly ? "mo" : "yr"}</span>
                </span>
              </div>
              <p className={styles.perDay}>
                {perDay} / day · Cancel anytime
              </p>
            </div>

            <ul className={styles.listPro}>
              {proFeatures.map((feat) => (
                <li key={feat}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>

            <button type="button" className={styles.cta}>
              Upgrade to Pro
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </article>
        </div>
      </div>
    </div>
  );
}
