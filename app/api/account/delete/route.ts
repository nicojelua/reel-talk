import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  try {
    // Get the currently logged-in user using the normal
    // server-side Supabase client.
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Nobody should be able to use this route unless
    // they are actually logged in.
    if (userError || !user) {
      return Response.json(
        {
          error: "You must be logged in to delete your account.",
        },
        {
          status: 401,
        }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const secretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !secretKey) {
      console.error(
        "Missing Supabase server environment variables."
      );

      return Response.json(
        {
          error:
            "Account deletion is not configured correctly.",
        },
        {
          status: 500,
        }
      );
    }

    // This client has admin privileges.
    // IMPORTANT: It exists only on the server.
    const adminSupabase = createAdminClient(
      supabaseUrl,
      secretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // We use the ID from the authenticated session.
    // The browser never gets to choose which user ID
    // should be deleted.
    const { error: deleteError } =
      await adminSupabase.auth.admin.deleteUser(
        user.id
      );

    if (deleteError) {
      console.error(
        "Could not delete Reel Talk account:",
        deleteError
      );

      return Response.json(
        {
          error:
            "We couldn't delete your account. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Unexpected account deletion error:",
      error
    );

    return Response.json(
      {
        error:
          "Something went wrong while deleting your account.",
      },
      {
        status: 500,
      }
    );
  }
}