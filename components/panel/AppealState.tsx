"use client";

import { useTransition } from "react";
import { setAppealState } from "@/app/(panel)/[panel]/actions";

export function AppealState({ id, state, states }: { id: number; state: string; states: { value: string; label: string }[] }) {
  const [pending, start] = useTransition();
  return (
    <div className={`inline-flex gap-1 rounded-full bg-sand p-1 ${pending ? "opacity-60" : ""}`}>
      {states.map((s) => (
        <button key={s.value} type="button" disabled={pending || s.value === state}
                onClick={() => start(() => setAppealState(id, s.value))}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  s.value === state ? "bg-ink text-paper" : "text-muted hover:text-ink"
                }`}>
          {s.label}
        </button>
      ))}
    </div>
  );
}
