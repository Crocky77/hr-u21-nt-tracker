import Head from 'next/head'
import Link from 'next/link'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function Home() {
  const comingSoonLinks = [
    '/requests',
    '/lists',
    '/players',
    '/alerts',
    '/training-settings',
    '/snapshots',
    '/u21-status',
    '/u21-kalkulator',
  ]

  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      <div className="hr-homeBg">
        <Header />

        <main className="hr-main">
          <div className="hr-container">
            <section className="home-mainPanel">
              <h1 className="home-panelTitle">
                Moji igrači u Hrvatskom trackeru
              </h1>

              <p className="home-panelSubtitle">
                CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji
                igrači”.
              </p>

              <div className="home-loginRow">
                <button className="home-loginBtn">Admin login</button>
                <Link href="/my-players" className="home-loginBtn ghost">
                  CHPP login
                </Link>
              </div>

              <Link href="/my-players" className="home-panelLink">
                Otvori “Moji igrači”
              </Link>

              <div className="home-tilesRow">
                <Link href="/team/nt" className="home-tile image">
                  <img
                    className="home-tileImage"
                    src="/home/tile-nt.png"
                    alt="NT Hrvatska"
                  />
                </Link>

                <Link href="/team/u21" className="home-tile image">
                  <img
                    className="home-tileImage"
                    src="/home/tile-u21.png"
                    alt="U21 Hrvatska"
                  />
                </Link>

                <Link href="/team/nt/transfers" className="home-tile transfer">
                  <div className="home-transferIcon">⇅</div>
                  <div className="home-transferTitle">Transfer lista</div>
                  <div className="home-transferSub">U izradi</div>
                </Link>
              </div>

              <div className="home-subTiles">
                {comingSoonLinks.map((href) => (
                  <Link key={href} href={href} className="home-subTile">
                    <span>U izradi</span>
                  </Link>
                ))}
              </div>
            </section>

            <Footer />
          </div>
        </main>
      </div>
    </>
  )
}
