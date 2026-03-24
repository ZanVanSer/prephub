import type {
  AdminTabId,
  AdminUserFilters,
  AdminUserRecord
} from "@/modules/admin/types";

export const ADMIN_TABS: Array<{ href: string; id: AdminTabId; label: string }> = [
  {
    href: "/admin",
    id: "users",
    label: "Users"
  },
  {
    href: "/admin/roles",
    id: "roles",
    label: "Roles"
  },
  {
    href: "/admin/modules",
    id: "modules",
    label: "Modules"
  }
];

export const ADMIN_FILTER_ALL = "all" as const;

export function getAdminTabFromPathname(pathname: string): AdminTabId {
  if (pathname.startsWith("/admin/roles")) {
    return "roles";
  }

  if (pathname.startsWith("/admin/modules")) {
    return "modules";
  }

  return "users";
}

export function filterAdminUsers(users: AdminUserRecord[], filters: AdminUserFilters) {
  const query = filters.query.trim().toLowerCase();

  return users.filter((user) => {
    const matchesQuery = !query || user.email.toLowerCase().includes(query);
    const matchesRole = filters.role === "all" || user.role === filters.role;
    const matchesPlan = filters.plan === "all" || user.plan === filters.plan;
    const matchesStatus = filters.status === "all" || user.status === filters.status;

    return matchesQuery && matchesRole && matchesPlan && matchesStatus;
  });
}
