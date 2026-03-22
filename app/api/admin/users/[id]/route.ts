import { NextResponse } from "next/server";
import { getAccessContext } from "@/lib/auth/access";
import { validateAdminUserUpdate } from "@/modules/admin/lib/contracts";
import { updateAdminUser } from "@/modules/admin/lib/users";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const accessContext = await getAccessContext();

    if (!accessContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (accessContext.profile.status !== "active") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (accessContext.profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const payload = validateAdminUserUpdate(await request.json());
    const updatedUser = await updateAdminUser({
      actorUserId: accessContext.user.id,
      targetUserId: id,
      input: payload
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update user.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
