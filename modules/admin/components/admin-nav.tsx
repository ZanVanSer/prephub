"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_TABS } from "@/modules/admin/lib/view-model";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="module-tabs" aria-label="Admin">
      {ADMIN_TABS.map((tab) => {
        const isActive = tab.id === "users" ? pathname === "/admin" : pathname.startsWith(tab.href);

        return (
          <Link key={tab.id} href={tab.href} className={isActive ? "module-tab module-tab--active" : "module-tab"}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
