import Link from "next/link";
import { Nav } from "./nav";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Job Tracker
        </Link>
        <Nav />
      </div>
    </header>
  );
}
