import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/auth/access";
import { getAccessContext } from "@/lib/auth/access";
import { updateRoleConfiguration } from "@/modules/admin/lib/roles";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ role: string }> }
) {
  try {
    const accessContext = await getAccessContext();

    if (!accessContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (accessContext.profile.status !== "active" || accessContext.profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { role } = await context.params;
    const updatedRoleConfig = await updateRoleConfiguration({
      role: role as UserRole,
      input: await request.json()
    });

    return NextResponse.json({ roleConfig: updatedRoleConfig });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update role configuration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
