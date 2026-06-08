import { Menu, Search, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "preact/hooks";
import { route } from "preact-router";

export const Header = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: Event) => {
    e.preventDefault();
    if (query.trim()) {
      route(`/?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-4 px-4 w-full">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <a href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Tv className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline-block">OpenTube</span>
          </a>
        </div>

        <form onSubmit={handleSearch} className="flex flex-1 items-center max-w-2xl gap-2">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="検索"
              className="w-full bg-muted/50 focus-visible:bg-background"
              value={query}
              onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            />
          </div>
          <Button type="submit" variant="secondary" size="icon" className="shrink-0">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="flex items-center gap-2">
          {/* User profile could go here */}
        </div>
      </div>
    </header>
  );
};
