import Link from "next/link";
import { SiteChrome } from "@/components/SiteChrome";
import { Arrow } from "@/components/ui";

export default function NotFound() {
  return (
    <SiteChrome>
    <section className="container-x flex min-h-[80vh] flex-col justify-center pt-32 pb-20">
      <p className="eyebrow">404</p>
      <h1 className="h-display mt-5 text-[clamp(48px,9vw,128px)]">
        Bu qavat<br /><span className="text-accent">hali qurilmagan.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-muted">Siz izlagan sahifa topilmadi yoki ko&apos;chirilgan.</p>
      <div className="mt-10">
        <Link href="/" className="btn btn-ink">Bosh sahifaga <Arrow /></Link>
      </div>
    </section>
    </SiteChrome>
  );
}
