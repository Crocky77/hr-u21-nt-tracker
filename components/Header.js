// components/Header.js
import { useEffect, useState } from "react";
import Link from "next/link";

function readFirstLocalStorageKey(keys) {
  try {
    for (const k of keys) {
      const v = window.localStorage.getItem(k);
      if (v && String(v).trim()) return v;
    }
  } catch (_) {}
  return "";
}

export default function Header({ title = "Hrvatski U21/NT Tracker" }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    // Pokušaj povući isto što si ranije imao (bez razbijanja ako nema)
    const e = readFirstLocalStorageKey([
      "hr_user_email",
      "hr_tracker_user_email",
      "user_email",
      "email",
    ]);

    const r = readFirstLocalStorageKey([
      "hr_user_role",
      "hr_tracker_user_role",
      "user_role",
      "role",
    ]);

    setEmail(e);
    setRole(r);
  }, []);

  return (
    <div className="hr-headerWrap">
      <header className="hr-header">
        {/* cijeli header klikabilan */}
        <Link href="/" className="hr-headerLink" aria-label="Naslovnica">
          <div className="hr-headerLeft">
            <img className="hr-logo" src="/logo.png" alt="HR Tracker logo" />
            <div className="hr-headerTitle">{title}</div>
          </div>

          <div className="hr-headerRight">
            {email ? (
              <>
                <div>
                  Dobrodošao: <strong>{email}</strong>
                </div>
                {role ? <div>prijavljen kao: <strong>{role}</strong></div> : null}
              </>
            ) : null}
          </div>
        </Link>
      </header>
    </div>
  );
}
