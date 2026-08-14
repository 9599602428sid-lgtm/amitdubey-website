import { NextResponse } from "next/server";
import { getStaffUser } from "@/lib/auth";
import { readCaseUpload } from "@/lib/cases";

export const runtime = "nodejs";

function contentDisposition(filename: string, inline: boolean): string {
  const kind = inline ? "inline" : "attachment";
  const ascii = filename.replace(/[^\x20-\x7E]+/g, "_").replace(/"/g, "");
  return `${kind}; filename="${ascii || "file"}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ caseNumber: string; fileId: string }> },
) {
  const user = await getStaffUser();
  if (!user) {
    return NextResponse.redirect(new URL("/internal/login", request.url));
  }

  const { caseNumber, fileId } = await context.params;
  const file = await readCaseUpload(caseNumber, fileId);
  if (!file) return new NextResponse("Not found", { status: 404 });

  const inline = new URL(request.url).searchParams.get("inline") === "1" && file.mimeType.startsWith("image/");
  return new NextResponse(new Uint8Array(file.bytes), {
    status: 200,
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": contentDisposition(file.originalName, inline),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
