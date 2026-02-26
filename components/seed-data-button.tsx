"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

export function SeedDataButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/seed", { method: "POST" });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        console.error("Failed to seed:", data.error);
      }
    } catch (error) {
      console.error("Failed to seed database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleSeed} disabled={isLoading}>
      <Database className="mr-2 h-4 w-4" />
      {isLoading ? "Loading..." : "Load Sample Data"}
    </Button>
  );
}
