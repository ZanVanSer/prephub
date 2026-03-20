import { POST as handlePOST } from "@/modules/mj-tool/lib/convert-route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handlePOST(request);
}
