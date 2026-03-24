import { NextResponse } from "next/server";
import { getAccessContext } from "@/lib/auth/access";
import type { AppModuleId } from "@/lib/modules/access";
import { updateModuleConfiguration } from "@/modules/admin/lib/modules";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ moduleId: string }> }
) {
  try {
    const accessContext = await getAccessContext();

    if (!accessContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (accessContext.profile.status !== "active" || accessContext.profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { moduleId } = await context.params;
    const updatedModuleConfig = await updateModuleConfiguration({
      moduleId: moduleId as AppModuleId,
      input: await request.json()
    });

    return NextResponse.json({ moduleConfig: updatedModuleConfig });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update module configuration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
