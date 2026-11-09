import type { Metadata } from "next";
import { FilterTabs } from "@/components/FilterTabs";
import { PageHero, ProjectCard } from "@/components/ui";
import { getProjects } from "@/lib/api";

export const metadata: Metadata = {
  title: "Loyihalarimiz",
  description: "Arxan turar-joy majmualari: qurilayotgan, sotuvdagi va topshirilgan loyihalar.",
};

const STATUSES = [
  { key: "qurilmoqda", label: "Qurilmoqda" },
  { key: "sotuvda", label: "Sotuvda" },
  { key: "topshirilgan", label: "Topshirilgan" },
];

export default async function ProjectsPage() {
  const projects = await getProjects();
  const tabs = [
    { key: "all", label: "Barchasi", count: projects.length },
    ...STATUSES.map((s) => ({ ...s, count: projects.filter((p) => p.status === s.key).length })),
  ];

  return (
    <>
      <PageHero title="Loyihalarimiz" />
      <section className="container-x pb-32">
        {projects.length === 0 ? (
          <p className="text-muted">Loyihalar tez orada qo&apos;shiladi.</p>
        ) : (
          <FilterTabs tabs={tabs} className="grid gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p, i) => (
              <div key={p.slug} data-key={p.status}>
                <ProjectCard project={p} index={i} />
              </div>
            ))}
          </FilterTabs>
        )}
      </section>
    </>
  );
}
