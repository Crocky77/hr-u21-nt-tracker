import Link from "next/link";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      setEmail(userEmail);

      if (userEmail) {
        const { data: urows } = await supabase
          .from("users")
          .select("role")
          .eq("email", userEmail)
          .limit(1);

        if (urows && urows.length) setRole(urows[0].role);
      }
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  return (
    <AppLayout
      title="Odaberi tim"
      subtitle="Odaberi U21 ili NT. Svaki tim ima svoj dashboard, igrače i upozorenja."
      badgeLeft="Odaberi tim"
      badgeRight={role ? role : ""}
    >
      <div className="hero">
        <div className="heroLeft">
          <div className="note">
            <div className="noteTitle">V1 faza</div>
            <div className="noteText">
              Ručno dodavanje igrača + bilješke + U21 cutoff widget.
              CHPP sync dolazi čim dobijemo licencu.
            </div>
          </div>
        </div>

        <div className="heroRight">
          {email ? (
            <button className="logout" onClick={logout}>Odjava</button>
          ) : (
            <Link className="login" href="/login">Prijava →</Link>
          )}
        </div>
      </div>

      <div className="grid">
        {/* U21 */}
        <div className="card">
          <div className="cardTop">
            <div>
              <div className="teamTitle">U21 Hrvatska</div>
              <div className="teamStaff">
                Izbornik: <strong>matej1603</strong> · Pomoćnik: <strong>Zvonzi_</strong>
              </div>
            </div>

            <div className="kits">
              <div className="kit home" title="Domaći dres" />
              <div className="kit away" title="Gostujući dres" />
            </div>
          </div>

          <div className="desc">
            U21 dashboard ima U21-ciklus widget (tko može do odabranog datuma),
            “izlaze uskoro” i trening alarme (skeleton).
          </div>

          <div className="actions">
            <Link className="primary" href="/team/u21/dashboard">
              → Otvori dashboard
            </Link>
            <div className="hint">* osoblje vidi samo svoj tim (admin vidi sve)</div>
          </div>
        </div>

        {/* NT */}
        <div className="card">
          <div className="cardTop">
            <div>
              <div className="teamTitle">NT Hrvatska</div>
              <div className="teamStaff">
                Izbornik: <strong>Zagi_</strong> · Pomoćnik: <strong>Nosonja</strong>
              </div>
            </div>

            <div className="kits">
              <div className="kit home" title="Domaći dres" />
              <div className="kit away" title="Gostujući dres" />
            </div>
          </div>

          <div className="desc">
            NT dashboard nema U21 ciklus. Ima svoje widgete i trening alarme (skeleton),
            a kasnije tracking forme/stamine/treninga.
          </div>

          <div className="actions">
            <Link className="primary" href="/team/nt/dashboard">
              → Otvori dashboard
            </Link>
            <div className="hint">* osoblje vidi samo svoj tim (admin vidi sve)</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero {
          background: rgba(255,255,255,0.78);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 18px;
          padding: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          box-shadow: 0 18px 45px rgba(0,0,0,0.08);
        }
        .noteTitle {
          font-weight: 1000;
          color: #111;
          margin-bottom: 4px;
        }
        .noteText {
          font-weight: 700;
          color: rgba(0,0,0,0.65);
          font-size: 13px;
          line-height: 1.35;
        }
        .logout, .login {
          border: none;
          border-radius: 14px;
          padding: 10px 14px;
          font-weight: 1000;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .logout {
          background: #111;
          color: #fff;
        }
        .login {
          background: rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.15);
          color: #111;
        }

        .grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .card {
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 18px 45px rgba(0,0,0,0.08);
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .teamTitle {
          font-weight: 1000;
          font-size: 20px;
          color: #111;
          letter-spacing: -0.2px;
        }
        .teamStaff {
          margin-top: 6px;
          font-weight: 700;
          font-size: 13px;
          color: rgba(0,0,0,0.65);
        }

        .kits {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .kit {
          width: 46px;
          height: 56px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.12);
          position: relative;
          box-shadow: inset 0 0 0 2px rgba(255,255,255,0.18);
        }
        .kit:before, .kit:after {
          content: "";
          position: absolute;
          top: 12px;
          width: 14px;
          height: 18px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.12);
        }
        .kit:before { left: -8px; }
        .kit:after  { right: -8px; }

        .home {
          background:
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(0,0,0,0.10)),
            linear-gradient(90deg, #b10d0d 0%, #b10d0d 48%, #ffffff 48%, #ffffff 52%, #b10d0d 52%, #b10d0d 100%);
        }
        .away {
          background:
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(0,0,0,0.08)),
            linear-gradient(90deg, #ffffff 0%, #ffffff 45%, #0b2a6a 45%, #0b2a6a 55%, #ffffff 55%, #ffffff 100%);
        }

        .desc {
          margin-top: 12px;
          font-weight: 700;
          color: rgba(0,0,0,0.68);
          font-size: 13px;
          line-height: 1.4;
        }

        .actions {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .primary {
          text-decoration: none;
          background: #111;
          color: #fff;
          padding: 12px 14px;
          border-radius: 14px;
          font-weight: 1000;
          text-align: center;
        }

        .hint {
          font-size: 12px;
          color: rgba(0,0,0,0.6);
          font-weight: 700;
          text-align: center;
        }

        @media (max-width: 900px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </AppLayout>
  );
}
