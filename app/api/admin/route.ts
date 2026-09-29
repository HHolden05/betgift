import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

function authorized(request: Request) {
  const expected = process.env.ADMIN_ACCESS_KEY;
  const provided = request.headers.get("x-admin-key");
  return Boolean(expected && provided && provided === expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();

  const [{ data: gifts, error: giftsError }, { data: requests, error: requestsError }] = await Promise.all([
    supabase
      .from("gifts")
      .select("code,recipient_name,recipient_email,recipient_phone,amount,event_data,bet_data,status,email_status,created_at,opened_at,claimed_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("request_logs")
      .select("id,created_at,method,path,user_agent,referer")
      .order("created_at", { ascending: false })
      .limit(300)
  ]);

  if (giftsError || requestsError) {
    console.error("Admin data query failed", giftsError || requestsError);
    return NextResponse.json({ error: "Could not load admin data" }, { status: 503 });
  }

  return NextResponse.json({ gifts: gifts ?? [], requests: requests ?? [] });
}
