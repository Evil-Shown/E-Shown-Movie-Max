"use client";

import { motion } from "framer-motion";

export default function FooterDivider() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="h-px w-full origin-left"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
      }}
    />
  );
}
