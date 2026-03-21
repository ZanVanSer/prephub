"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BellIcon, SearchIcon, SettingsIcon, UserIcon } from "@/components/ui/icons";

export function AppHeader({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("q") ?? "";

  function handleSearchChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <header className="app-header">
      <label className="search-shell" aria-label="Search tools or projects">
        <span className="search-shell__icon">
          <SearchIcon />
        </span>
        <input
          className="search-shell__input"
          type="search"
          placeholder="Search tools or projects..."
          value={searchValue}
          onChange={(event) => handleSearchChange(event.target.value)}
        />
      </label>

      <div className="app-header__actions">
        <button type="button" className="icon-button" aria-label="Notifications">
          <BellIcon />
        </button>
        <Link href="/settings" className="icon-button" aria-label="Settings">
          <SettingsIcon />
        </Link>
        <button type="button" className="user-pill" aria-label={userEmail} title={userEmail}>
          <span className="user-pill__avatar">
            <UserIcon />
          </span>
        </button>
      </div>
    </header>
  );
}
