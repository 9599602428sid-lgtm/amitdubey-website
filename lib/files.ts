const PDF = Buffer.from("%PDF");
const JPEG = Buffer.from([0xff, 0xd8, 0xff]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ZIP = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

export type AllowedKind = "pdf" | "jpeg" | "png" | "docx";

function startsWith(buf: Buffer, sig: Buffer): boolean {
  return buf.subarray(0, sig.length).equals(sig);
}

export function detectAllowedFile(name: string, bytes: Buffer): AllowedKind | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf") && startsWith(bytes, PDF)) return "pdf";
  if ((lower.endsWith(".jpg") || lower.endsWith(".jpeg")) && startsWith(bytes, JPEG)) return "jpeg";
  if (lower.endsWith(".png") && startsWith(bytes, PNG)) return "png";
  if (lower.endsWith(".docx") && startsWith(bytes, ZIP)) {
    const asString = bytes.subarray(0, Math.min(bytes.length, 8000)).toString("utf8");
    if (asString.includes("word/") || asString.includes("[Content_Types].xml")) return "docx";
    return null;
  }
  return null;
}

export function mimeFor(kind: AllowedKind): string {
  switch (kind) {
    case "pdf":
      return "application/pdf";
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
}

export async function virusScan(bytes: Buffer): Promise<{ clean: boolean; reason?: string }> {
  const socket = process.env.CLAMAV_SOCKET;
  if (!socket) {
    if (bytes.includes(Buffer.from("X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR"))) {
      return { clean: false, reason: "Blocked test signature." };
    }
    return { clean: true };
  }

  try {
    const net = await import("node:net");
    const result = await new Promise<string>((resolve, reject) => {
      const client = net.createConnection(socket);
      const chunks: Buffer[] = [];
      client.on("error", reject);
      client.on("data", (c) => chunks.push(c as Buffer));
      client.on("connect", () => {
        client.write("zINSTREAM\0");
        const size = Buffer.alloc(4);
        size.writeUInt32BE(bytes.length, 0);
        client.write(size);
        client.write(bytes);
        const end = Buffer.alloc(4);
        end.writeUInt32BE(0, 0);
        client.write(end);
      });
      client.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
    if (/FOUND/.test(result) && !/OK/.test(result)) {
      return { clean: false, reason: "File failed the virus scan." };
    }
    return { clean: true };
  } catch {
    return { clean: false, reason: "Virus scanning is unavailable. Please try again later." };
  }
}
