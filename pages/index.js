import Link from "next/link";

function TileImageLink({ href, imgSrc, alt }) {
  return (
    <Link href={href} className="tile tile--image" aria-label={alt}>
      <img src={imgSrc} alt={alt} className="tile__img" />
    </Link>
  );
}

function TileComingSoon({ index }) {
  return (
    <Link
      href={`/coming-soon?slot=${index}`}
      className="tile tile--soon"
      aria-label="U izradi"
    >
      U izradi
    </Link>
  );
}

export default function Home() {
  return (
    <div className="home">
      <Link href="/my-players" className="home__cardLink" aria-label="Moji igrači">
        <section className="home__card">
          <h1 className="home__headline">Moji igrači u Hrvatskom trackeru</h1>
          <p className="home__sub">
            CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
          </p>

          <div className="home__gridTop">
            <TileImageLink
              href="/team/nt"
              imgSrc="/home/tile-nt.png"
              alt="NT Hrvatska"
            />
            <TileImageLink
              href="/team/u21"
              imgSrc="/home/tile-u21.png"
              alt="U21 Hrvatska"
            />
            <TileImageLink
              href="/team/nt/transfers"
              imgSrc="/home/tile-transfers.png"
              alt="Transfer lista"
            />
          </div>

          <div className="home__gridSoon">
            {Array.from({ length: 8 }).map((_, i) => (
              <TileComingSoon key={i} index={i + 1} />
            ))}
          </div>

          <div className="home__divider" />

          <footer className="home__footer">
            <Link href="/about" className="home__footerLink">
              O alatu
            </Link>
            <Link href="/help" className="home__footerLink">
              Pomoć
            </Link>
            <Link href="/donations" className="home__footerLink">
              Donacije
            </Link>
            <Link href="/privacy" className="home__footerLink">
              Privacy
            </Link>
            <Link href="/terms" className="home__footerLink">
              Terms
            </Link>
          </footer>
        </section>
      </Link>
    </div>
  );
}
