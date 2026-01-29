import Link from "next/link";
import { useRouter } from "next/router";

export default function ComingSoon() {
  const router = useRouter();
  const slot = router.query.slot || "";

  return (
    <div className="page">
      <div className="page__card">
        <h1 className="page__title">U izradi</h1>
        <p className="page__text">
          Ovaj modul je rezerviran za buduće funkcionalnosti.
          {slot ? ` (slot ${slot})` : ""}
        </p>

        <div className="page__actions">
          <Link href="/" className="btn">
            ← Nazad na naslovnicu
          </Link>
        </div>
      </div>
    </div>
  );
}
