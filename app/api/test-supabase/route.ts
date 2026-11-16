import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*");

  if (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }

  return Response.json({
    success: true,
    message: "Reel Talk is connected to Supabase!",
    data,
  });
}