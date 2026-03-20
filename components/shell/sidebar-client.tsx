"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TOOL_MODULES } from "@/lib/design/modules";
import { DashboardIcon, ImageIcon, MailIcon, MenuIcon } from "@/components/ui/icons";

function NavGlyph({ icon }: { icon: (typeof TOOL_MODULES)[number]["icon"] }) {
  if (icon === "image") {
    return <ImageIcon />;
  }

  if (icon === "mail") {
    return <MailIcon />;
  }

  return <DashboardIcon />;
}

export function SidebarClient() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={isCollapsed ? "app-sidebar app-sidebar--collapsed" : "app-sidebar"}>
      <div className="app-sidebar__top">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setIsCollapsed((current) => !current)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <MenuIcon />
        </button>

        <div className={isCollapsed ? "app-brand sr-only" : "app-brand"}>
          <div className="app-brand__mark">T</div>
          <div>
            <p className="app-brand__title">ToolHub</p>
            <p className="app-brand__subtitle">Creative Suite</p>
          </div>
        </div>
      </div>

      <nav className="app-sidebar__nav" aria-label="Primary">
        {TOOL_MODULES.map((item) => {
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
    </aside>
  );
}
