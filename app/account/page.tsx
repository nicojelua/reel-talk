import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountSettings from "@/components/AccountSettings";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Someone who isn't logged in shouldn't be able
  // to open the Account page.
  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-[#151313] px-6 pb-20 pt-32 text-[#F5EEE6]">
      <div className="mx-auto max-w-3xl">
        {/* PAGE HEADING */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8A0A8]">
            Reel Talk
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Your Account
          </h1>

          <p className="mt-3 text-[#B8AEA8]">
            A little corner of Reel Talk that's all yours.
          </p>
        </div>

        {/* ACCOUNT SETTINGS */}
        <div className="mt-10">
          <AccountSettings
            userId={user.id}
            email={user.email ?? ""}
            initialDisplayName={profile?.display_name ?? ""}
            initialUsername={profile?.username ?? ""}
          />
        </div>
      </div>
    </main>
  );
}