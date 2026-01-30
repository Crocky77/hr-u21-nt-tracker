import Link from "next/link";

export default function TileNT() {
  return (
    <Link href="/team/nt" className="home-tile image nt">
      <div className="home-tileOverlay">
        <span className="home-tileTitle">NT Hrvatska</span>
      </div>
    </Link>
  );
}
