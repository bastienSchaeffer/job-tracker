"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid } from "lucide-react";
import type { JobsViewMode } from "@/lib/types";

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = (searchParams.get("view") as JobsViewMode) ?? "list";

  const setView = (view: JobsViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "list") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    const queryString = params.toString();
    router.push(`/jobs${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label="View mode">
      <Button
        variant={currentView === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => setView("list")}
        aria-label="List view"
        aria-pressed={currentView === "list"}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === "board" ? "default" : "outline"}
        size="sm"
        onClick={() => setView("board")}
        aria-label="Board view"
        aria-pressed={currentView === "board"}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
