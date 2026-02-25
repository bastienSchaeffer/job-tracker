"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";

export type SortOrder = "asc" | "desc";

export function SortToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get("sort") as SortOrder) ?? "desc";

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    const newSort = currentSort === "desc" ? "asc" : "desc";
    params.set("sort", newSort);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleToggle}>
      {currentSort === "desc" ? (
        <>
          <ArrowDown className="mr-2 h-4 w-4" />
          Newest first
        </>
      ) : (
        <>
          <ArrowUp className="mr-2 h-4 w-4" />
          Oldest first
        </>
      )}
    </Button>
  );
}
