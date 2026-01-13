import Link from "next/link";
import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

export default function Home() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;

      if (!userEmail) {
        setIsLoggedIn(false);
        setSessionChecked(true);
        return;
      }

      setIsLoggedIn(true);
      setEmail(userEmail);

      const { data: urows } = await supabase
        .from("users")
        .select("role")
        .eq("email", userEmail)
        .limit(1);

      setRole(urows?.[0]?.role ?? null);
      setSessionChecked(true);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  if (!sessionChecked) {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>
        Učitavam...
      </main>
    );
  }

  // NISI LOGIRAN
  if (!isLoggedIn) {
    return (
      <AppLayout teamType="PUBLIC" title="Odaberi tim">
        <div style={{ padding: 18 }}>
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              background: "rgba(255,255,255,0.92)",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 18
            }}
          >
            <h2 style={{ margin: 0, fontSize: 28 }}>Prijavi se da uđeš u alat</h2>
            <p style={{ marginTop: 10, opacity: 0.85 }}>
              Ovaj tracker je namijenjen HR U21 i NT timu. Prijava je trenutno preko emaila (privremeno),
              a kasnije ide preko Hattrick CHPP.
            </p>

            <Link
              href="/login"
              style={{
                display: "inline-flex",
                marginTop: 10,
                padding: "12px 14px",
                borderRadius: 12,
                background: "#111",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 900
              }}
            >
              Prijava →
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  // LOGIRAN
  return (
    <AppLayout teamType="PUBLIC" title="Odaberi tim">
      <div style={{ padding: 18 }}>
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            background: "rgba(255,255,255,0.92)",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 18
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 28 }}>Odaberi tim</h2>
              <div style={{ marginTop: 8, opacity: 0.85 }}>
                Ulogiran: <strong>{email}</strong>
                {role ? (
                  <>
                    {" "}
                    · Uloga: <strong>{role}</strong>
                  </>
                ) : null}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
                (V1) Ručno dodavanje igrača + bilješke. CHPP sync dolazi čim dobijemo licencu.
              </div>
            </div>

            <button
              onClick={logout}
              style={{
                height: 42,
                padding: "10px 14px",
                borderRadius: 12,
                border: "none",
                background: "#111",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
                alignSelf: "flex-start"
              }}
            >
              Odjava
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14
            }}
          >
            {/* U21 */}
            <div
              style={{
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                padding: 16,
                background: "#fff"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: "#7f1d1d" }}>U21 Hrvatska</div>
                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                    Izbornik: <strong>matej1603</strong> · Pomoćnik: <strong>Zvonzi_</strong>
                  </div>
                </div>

                <Link
                  href="/team/u21/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#111",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 900,
                    height: 42
                  }}
                >
                  → Otvori dashboard
                </Link>
              </div>

              <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
                U21 dashboard ima U21-ciklus widgete (tko može do odabranog datuma), “izlaze uskoro”, i trening alarme (skeleton).
              </div>
            </div>

            {/* NT */}
            <div
              style={{
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                padding: 16,
                background: "#fff"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: "#7f1d1d" }}>NT Hrvatska</div>
                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                    Izbornik: <strong>Zagi_</strong> · Pomoćnik: <strong>Nosonja</strong>
                  </div>
                </div>

                <Link
                  href="/team/nt/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "#111",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 900,
                    height: 42
                  }}
                >
                  → Otvori dashboard
                </Link>
              </div>

              <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
                NT dashboard nema U21 ciklus. Ima svoje widgete i trening alarme (skeleton) + kasnije tracking forme/stamine/treninga.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Savjet: odaberi tim i odmah ulaziš u odgovarajući dashboard. Skauti i osoblje vide samo svoj tim (admin vidi sve).
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
