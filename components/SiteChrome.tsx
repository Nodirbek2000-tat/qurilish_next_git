import { Effects } from "./Effects";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Intro } from "./HouseLoader";
import { getSite } from "@/lib/api";
import { telHref } from "@/lib/format";

/** Saytning umumiy qobig'i: intro, menyu, footer. Admin panelda yo'q. */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <>
      <Intro />
      <Header phone={site.phone} phoneHref={telHref(site.phone)} />
      <main className="flex-1">{children}</main>
      <Footer site={site} />
      <Effects />
    </>
  );
}
