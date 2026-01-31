import Link from "next/link";
import styles from "./TileFeatured.module.css";

export default function TileFeatured({ href, image, label }) {
  return (
    <Link
      href={href}
      className={styles.featuredTile}
      aria-label={label}
      title={label}
    >
      <div className={styles.frame}>
        <div className={styles.inner}>
          <img
            src={image}
            alt={label}
            className={styles.image}
            draggable="false"
          />
          <div className={styles.mask} />
        </div>
      </div>
    </Link>
  );
}
