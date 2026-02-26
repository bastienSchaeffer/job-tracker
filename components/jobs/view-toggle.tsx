"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, LayoutGrid } from "lucide-react";
import type { JobsViewMode } from "@/lib/types";

const STORAGE_KEY = "jobs-view-mode";
const DEFAULT_VIEW: JobsViewMode = "board";

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);

  // Get view from URL, localStorage, or default
  const urlView = searchParams.get("view") as JobsViewMode | null;

  useEffect(() => {
    setIsHydrated(true);

    // On initial load, if no URL param, check localStorage and redirect if needed
    if (!urlView) {
      const storedView = localStorage.getItem(STORAGE_KEY) as JobsViewMode | null;
      const preferredView = storedView ?? DEFAULT_VIEW;

      if (preferredView !== "list") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", preferredView);
        router.replace(`/jobs?${params.toString()}`);
      }
    }
  }, [urlView, searchParams, router]);

  // Current view: URL param > localStorage > default
  const currentView: JobsViewMode = urlView ?? DEFAULT_VIEW;

  const setView = (view: JobsViewMode) => {
    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, view);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (view === "list") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    const queryString = params.toString();
    router.push(`/jobs${queryString ? `?${queryString}` : ""}`);
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isHydrated) {
    return (
      <div className="h-9 w-[74px] rounded-md bg-muted animate-pulse" />
    );
  }

  return (
    <ToggleGroup
      type="single"
      value={currentView}
      onValueChange={(value) => {
        if (value) setView(value as JobsViewMode);
      }}
      variant="outline"
      size="sm"
      aria-label="View mode"
    >
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="board" aria-label="Board view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
