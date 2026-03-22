"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MJ_TOOL_TABS } from "@/lib/design/modules";

export function MjToolNav() {
  const pathname = usePathname();

  return (
    <nav className="module-tabs" aria-label="MJML Tool">
      {MJ_TOOL_TABS.map((item) => {
        const isActive = item.href === "/mj-tool" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link key={item.href} href={item.href} className={isActive ? "module-tab module-tab--active" : "module-tab"}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
