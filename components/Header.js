import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * Globalni header (logo + naslov + opcionalni linkovi desno + info o prijavi).
 * - Cijeli header je klikabilan (vodi na /)
 * - Na naslovnici (home) NE prikazujemo desne linkove (Naslovnica / NT / U21)
 */
export default function Header({
  title = 'Hrvatski U21/NT Tracker',
  showNavLinks = true,
  showUserInfo = true,
}) {
  const [user, setUser] = useState(null);
  const [roleLabel, setRoleLabel] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!isMounted) return;
        setUser(data?.user ?? null);

        // Role (MVP): pokušaj dohvatiti iz localStorage (ako postoji), inače fallback.
        try {
          const storedRole = window.localStorage.getItem('hr_tracker_role');
          if (storedRole) setRoleLabel(storedRole);
        } catch (_) {}
      } catch (_) {
        if (!isMounted) return;
        setUser(null);
      }
    }

    load();

    // Live auth updates
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const userLabel = useMemo(() => {
    if (!user) return null;
    return user.user_metadata?.full_name || user.email || user.id;
  }, [user]);

  return (
    <header className="hrHeader">
      <Link href="/" className="hrHeader__clickArea" aria-label="Naslovnica">
        <div className="hrHeader__left">
          <img
            src="/logo.png"
            alt="HR Tracker logo"
            className="hrHeader__logo"
          />
          <div className="hrHeader__title">{title}</div>
        </div>
      </Link>

      <div className="hrHeader__right">
        {showNavLinks && (
          <nav className="hrHeader__nav" aria-label="Glavni izbornik">
            <Link href="/" className="hrHeader__navLink">
              Naslovnica
            </Link>
            <Link href="/team/nt" className="hrHeader__navLink">
              NT
            </Link>
            <Link href="/team/u21" className="hrHeader__navLink">
              U21
            </Link>
          </nav>
        )}

        {showUserInfo && (
          <div className="hrHeader__user">
            {userLabel ? (
              <>
                <div className="hrHeader__userLine">
                  Dobrodošao: <span className="hrHeader__userStrong">{userLabel}</span>
                </div>
                <div className="hrHeader__userLine">
                  prijavljen kao:{' '}
                  <span className="hrHeader__userStrong">{roleLabel || 'admin'}</span>
                </div>
              </>
            ) : (
              <div className="hrHeader__userLine">Niste prijavljeni</div>
            )}
          </div>
        )}
      </div>

      {/* tanka crvena linija kao na referenci */}
      <div className="hrHeader__separator" />
    </header>
  );
}
