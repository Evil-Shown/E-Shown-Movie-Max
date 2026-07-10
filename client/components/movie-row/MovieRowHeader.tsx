import Link from "next/link";
import styles from "../MovieRow.module.css";

interface MovieRowHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  seeAllHref?: string;
}

export default function MovieRowHeader({ title, subtitle, eyebrow, seeAllHref = "/browse" }: MovieRowHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerInner}>
        <div>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <Link href={seeAllHref} className={styles.seeAll}>
          See all →
        </Link>
      </div>
    </div>
  );
}
