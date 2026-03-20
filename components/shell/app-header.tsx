"use client";

import { useRouter } from "next/navigation";
import { BellIcon, SettingsIcon } from "@/components/ui/icons";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase-browser";

export function AppHeader({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="app-header">
      <div className="search-shell">
        <span className="search-shell__icon">⌕</span>
        <span className="search-shell__text">Search tools or projects…</span>
      </div>

      <div className="app-header__actions">
        <button type="button" className="icon-button" aria-label="Notifications">
          <BellIcon />
        </button>
        <button type="button" className="icon-button" aria-label="Settings">
          <SettingsIcon />
        </button>
        <div className="user-pill">
          <span className="user-pill__avatar">{userEmail.slice(0, 1).toUpperCase()}</span>
          <span className="user-pill__email">{userEmail}</span>
        </div>
        <button type="button" className="button button--secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
