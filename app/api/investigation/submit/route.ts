import { NextResponse } from "next/server";
import { submitInvestigation } from "@/app/actions/submit-investigation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await submitInvestigation(formData);
  const status = result.ok ? 200 : result.code === "NOT_INDIA" ? 403 : result.code === "RATE" ? 429 : 400;
  return NextResponse.json(result, { status });
}
