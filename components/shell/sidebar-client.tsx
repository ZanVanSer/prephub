"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
  ImageIcon,
  LogoutIcon,
  MailIcon,
  SettingsIcon
} from "@/components/ui/icons";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase-browser";
import type { AppModuleView } from "@/lib/modules/access";

function NavGlyph({ icon }: { icon: AppModuleView["icon"] }) {
  if (icon === "image") {
    return <ImageIcon />;
  }

  if (icon === "mail") {
    return <MailIcon />;
  }

  if (icon === "settings") {
    return <SettingsIcon />;
  }

  return <DashboardIcon />;
}

export function SidebarClient({ navModules }: { navModules: AppModuleView[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className={isCollapsed ? "app-sidebar app-sidebar--collapsed" : "app-sidebar"}>
      <div className="app-sidebar__top">
        <div className={isCollapsed ? "app-brand sr-only" : "app-brand"}>
          <p className="app-brand__title">ToolHub</p>
        </div>
      </div>

      <nav className="app-sidebar__nav" aria-label="Primary">
        {navModules.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"}
            >
              <span className="sidebar-link__icon">
                <NavGlyph icon={item.icon} />
              </span>
              {!isCollapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="app-sidebar__bottom">
        <div className="app-sidebar__meta">
          <Button
            variant="secondary"
            className="sidebar-link sidebar-link--subtle sidebar-link--button"
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            aria-label="Logout"
          >
            <span className="sidebar-link__icon">
              <LogoutIcon />
            </span>
            {!isCollapsed ? <span>Logout</span> : null}
          </Button>
        </div>

        <button
          type="button"
          className="sidebar-collapse"
          onClick={() => setIsCollapsed((current) => !current)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
    </aside>
  );
}
