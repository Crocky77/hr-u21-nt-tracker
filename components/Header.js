import Link from "next/link";
import { useUser } from "../lib/useUser";

export default function Header() {
  const { user } = useUser?.() || { user: null };

  const email = user?.email || "";
  const role =
    user?.user_metadata?.role ||
    user?.user_metadata?.app_role ||
    user?.role ||
    "admin";

  return (
    <>
      <header className="hr-header">
        <div className="hr-headerInner">
          <div className="hr-headerLeft">
            <Link href="/" className="hr-logoLink" aria-label="Naslovnica">
              {/* logo.png je u /public/logo.png */}
              <img className="hr-logoImg" src="/logo.png" alt="HR Tracker logo" />
              <div className="hr-titleWrap">
                <div className="hr-title">Hrvatski U21/NT Tracker</div>
              </div>
            </Link>
          </div>

          <div className="hr-headerRight">
            {user ? (
              <div className="hr-userBox">
                <div className="hr-userLine">
                  <span className="hr-userLabel">Dobrodošao:</span>{" "}
                  <span className="hr-userValue">{email}</span>
                </div>
                <div className="hr-userLine">
                  <span className="hr-userLabel">Prijavljen kao:</span>{" "}
                  <span className="hr-userValue">{role}</span>
                </div>
              </div>
            ) : (
              <div className="hr-userBox">
                <div className="hr-userLine">
                  <span className="hr-userLabel">Nisi prijavljen</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* crvena linija kao na tvojoj slici */}
      <div className="hr-headerDivider" />
    </>
  );
}
