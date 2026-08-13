import { NextResponse } from "next/server";
import { submitInvestigation } from "@/app/actions/submit-investigation";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await submitInvestigation(formData);
    const status = result.ok ? 200 : result.code === "NOT_INDIA" ? 403 : result.code === "RATE" ? 429 : 400;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("investigation submit route failed", error);
    return NextResponse.json(
      { ok: false, code: "ERROR", message: "We could not submit the enquiry. Please try again." },
      { status: 500 },
    );
  }
}
