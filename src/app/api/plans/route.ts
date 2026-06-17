import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const { data } = await supabaseAdmin.from("subscription_plans").select("*").order("preco")
  return NextResponse.json(data || [])
}
