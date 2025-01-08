"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";

interface SearchFieldProps {
  className?: string;
}

export default function SearchField({ className }: SearchFieldProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();

    if (!q) return;

    // TODO why is router needed rather than window.redirect? How does encodeURIComponent() work?
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  }

  return (
    // * onSubmit requires JS though might take long to load on slow connections, use action prop to let user make GET req w/o JS and appends query param to URL, aka progressive enhancement
    <form
      className={cn("grow", className)}
      onSubmit={handleSubmit}
      method="GET"
      action="/shop"
    >
      <div className="relative">
        <Input className="pe-10" name="q" placeholder="Search" />
        <SearchIcon className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground" />
      </div>
    </form>
  );
}
