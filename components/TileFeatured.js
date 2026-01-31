import Link from "next/link";

export default function TileFeatured({ href, image, label }) {
  return (
    <Link href={href} className="featured-tile" aria-label={label} title={label}>
      <div className="featured-frame">
        <div className="featured-inner">
          <img
            src={image}
            alt={label}
            className="featured-image"
            draggable="false"
          />
          <div className="featured-mask" />
        </div>
      </div>
    </Link>
  );
}
