import { POST as handlePOST } from "@/modules/image-prep/lib/process-route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handlePOST(request);
}
