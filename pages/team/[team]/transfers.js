import Link from 'next/link';
import { useRouter } from 'next/router';
import AppLayout from '../../../components/AppLayout';

function safeStr(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

export default function TransfersTeamPage() {
  const router = useRouter();
  const team = safeStr(router.query.team || '').toLowerCase();

  const isValidTeam = team === 'u21' || team === 'nt';
  const teamLabel = team === 'u21' ? 'Hrvatska U21' : team === 'nt' ? 'Hrvatska NT' : 'Tim';

  return (
    <AppLayout variant="home" headerTitle="Hrvatski U21/NT Tracker" showHeaderNav={true}>
      <div className="hr-container">
        <div className="hr-homePanel" style={{ padding: 30 }}>
          <div style={{ fontWeight: 1000, fontSize: 36, letterSpacing: -0.4 }}>Transfer lista</div>

          {isValidTeam ? (
            <div style={{ marginTop: 6, opacity: 0.9 }}>
              Tim: <b>{teamLabel}</b>
            </div>
          ) : (
            <div style={{ marginTop: 6, opacity: 0.9 }}>
              Neispravan tim. Koristi <b>/team/u21/transfers</b> ili <b>/team/nt/transfers</b>.
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {isValidTeam ? (
              <Link className="hr-homePill" href={`/team/${team}`} style={{ textDecoration: 'none' }}>
                ← Natrag na module
              </Link>
            ) : (
              <>
                <Link className="hr-homePill" href="/team/u21" style={{ textDecoration: 'none' }}>
                  ← Natrag na U21 module
                </Link>
                <Link className="hr-homePill" href="/team/nt" style={{ textDecoration: 'none' }}>
                  ← Natrag na NT module
                </Link>
              </>
            )}

            <Link className="hr-homePill" href="/" style={{ textDecoration: 'none' }}>
              Naslovnica
            </Link>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div style={{ fontWeight: 1000, fontSize: 18 }}>Privremeno nedostupno</div>
            <div style={{ marginTop: 8, opacity: 0.92, lineHeight: 1.4 }}>
              Transfer modul je privremeno isključen.
              <br />
              Aktivirat će se nakon dobivanja službene <b>CHPP licence</b> (službeni izvor podataka).
            </div>
          </div>

          <div style={{ marginTop: 12, opacity: 0.82, fontSize: 13 }}>
            (Napomena: “scraping” izvori tipa Toxttrick ne rade pouzdano jer se transfer lista učitava dinamički.)
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
