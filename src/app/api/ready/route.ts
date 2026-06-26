import { NextResponse } from "next/server";

export async function GET(){ return NextResponse.json({ ok: true, database: "unknown_in_build" }); }
