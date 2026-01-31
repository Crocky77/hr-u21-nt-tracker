import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      <main style={{ padding: '60px 0' }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            background: 'rgba(0,0,0,0.35)',
            borderRadius: 20,
            padding: '40px',
          }}
        >
          <h1 style={{ textAlign: 'center', color: '#fff' }}>
            Moji igrači u Hrvatskom trackeru
          </h1>

          <p style={{ textAlign: 'center', color: '#ccc', marginBottom: 30 }}>
            CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
          </p>

          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <button style={{ marginRight: 10 }}>Admin / Tester login</button>
            <button disabled>CHPP login (uskoro)</button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 20,
              alignItems: 'center',
            }}
          >
            <Link href="/team/nt">
              <a>
                <img
                  src="/home/tile-nt.png"
                  alt="NT Hrvatska"
                  style={{ width: '100%', display: 'block' }}
                />
              </a>
            </Link>

            <Link href="/team/u21">
              <a>
                <img
                  src="/home/tile-u21.png"
                  alt="U21 Hrvatska"
                  style={{ width: '100%', display: 'block' }}
                />
              </a>
            </Link>

            <div
              style={{
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 14,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <strong>Transfer lista</strong>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Privremeno nedostupno (CHPP)
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
