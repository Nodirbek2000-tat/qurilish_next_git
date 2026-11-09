import type { Metadata } from "next";
import { FavoritesList } from "@/components/FavoritesList";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Sevimlilar", robots: { index: false } };

export default function FavoritesPage() {
  return (
    <>
      <PageHero title="Sevimlilar" />
      <section className="container-x pb-32">
        <FavoritesList />
      </section>
    </>
  );
}
