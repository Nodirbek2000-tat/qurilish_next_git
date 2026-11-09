import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HouseLoader } from "@/components/HouseLoader";
import { DeleteProject } from "@/components/panel/DeleteProject";
import { ProjectEditor } from "@/components/panel/ProjectEditor";
import { panelGet, panelPath, type Rec, type Schema } from "@/lib/panel";

const CHILDREN = ["arch", "interior", "lobby", "infra", "gallery", "catalog"] as const;

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "yangi";
  if (!isNew && !/^\d+$/.test(id)) notFound();
  const schema = await panelGet<Schema>("/schema/");
  const record = isNew ? null : await panelGet<Rec>(`/project/${id}/`);
  const children = isNew ? null : Object.fromEntries(await Promise.all(
    CHILDREN.map(async (k) => [k, (await panelGet<{ items: Rec[] }>(`/${k}/?project=${id}`)).items] as const),
  ));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href={panelPath("/loyihalar")} className="text-sm text-muted hover:text-accent">← Loyihalar</Link>
          <h1 className="h-display mt-2 text-[clamp(30px,3.6vw,44px)]">{record ? String(record.title) : "Yangi loyiha"}</h1>
        </div>
        {record && (
          <div className="flex flex-wrap gap-2">
            <a href={`/loyihalar/${record.slug}`} target="_blank" className="btn btn-ghost h-11 text-sm">
              <ExternalLink size={15} /> Saytda ko&apos;rish
            </a>
            <DeleteProject id={Number(record.id)} title={String(record.title)} flats={Number(record.flatTotal ?? 0)} />
          </div>
        )}
      </div>
      <ProjectEditor schema={schema} record={record} items={children} base={panelPath("/loyihalar")} />
    </div>
  );
}

export default function ProjectEditPage({ params }: { params: Promise<{ panel: string; id: string }> }) {
  return <Suspense fallback={<HouseLoader className="h-96" />}><Editor params={params} /></Suspense>;
}
