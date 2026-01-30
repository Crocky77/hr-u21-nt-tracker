import Link from "next/link";

export default function TileU21() {
  return (
    <Link href="/team/u21" className="home-tile image u21">
      <div className="home-tileOverlay">
        <span className="home-tileTitle">U21 Hrvatska</span>
      </div>
    </Link>
  );
}
