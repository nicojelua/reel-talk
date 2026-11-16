"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AccountSettingsProps = {
  userId: string;
  email: string;
  initialDisplayName: string;
  initialUsername: string;
};

export default function AccountSettings({
  userId,
  email,
  initialDisplayName,
  initialUsername,
}: AccountSettingsProps) {
  const router = useRouter();
  const supabase = createClient();

  // PROFILE
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // EMAIL
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  // PASSWORD
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // LOGOUT
  const [loggingOut, setLoggingOut] = useState(false);

  // DELETE ACCOUNT
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // -----------------------------
  // SAVE PROFILE
  // -----------------------------

  async function handleSaveProfile(
    event: React.SyntheticEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    const cleanDisplayName = displayName.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanDisplayName) {
      setProfileError("Please enter a display name.");
      setSavingProfile(false);
      return;
    }

    if (!cleanUsername) {
      setProfileError("Please choose a username.");
      setSavingProfile(false);
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      setProfileError(
        "Username must be 3–20 characters and can only contain letters, numbers, and underscores."
      );
      setSavingProfile(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          display_name: cleanDisplayName,
          username: cleanUsername,
        },
        {
          onConflict: "id",
        }
      );

    if (error) {
      if (error.code === "23505") {
        setProfileError(
          "That username is already taken. Try another one."
        );
      } else {
        setProfileError(error.message);
      }

      setSavingProfile(false);
      return;
    }

    setDisplayName(cleanDisplayName);
    setUsername(cleanUsername);
    setProfileMessage("Profile saved! 🎟️");
    setSavingProfile(false);

    router.refresh();
  }

  // -----------------------------
  // CHANGE EMAIL
  // -----------------------------

  async function handleChangeEmail(
    event: React.SyntheticEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setChangingEmail(true);
    setEmailMessage("");
    setEmailError("");

    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setEmailError("Please enter your new email address.");
      setChangingEmail(false);
      return;
    }

    if (cleanEmail === email.toLowerCase()) {
      setEmailError(
        "That's already the email connected to your account."
      );
      setChangingEmail(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      email: cleanEmail,
    });

    if (error) {
      setEmailError(error.message);
      setChangingEmail(false);
      return;
    }

    setEmailMessage(
      "Check your inbox 📬 Follow the confirmation instructions to finish changing your email."
    );

    setNewEmail("");
    setChangingEmail(false);
  }

  // -----------------------------
  // CHANGE PASSWORD
  // -----------------------------

  async function handleChangePassword(
    event: React.SyntheticEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setChangingPassword(true);
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "Your new password must be at least 8 characters."
      );
      setChangingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Your new passwords don't match.");
      setChangingPassword(false);
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "Your new password must be different from your current password."
      );
      setChangingPassword(false);
      return;
    }

    const { error: verifyError } =
      await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

    if (verifyError) {
      setPasswordError("Your current password is incorrect.");
      setChangingPassword(false);
      return;
    }

    const { error: updateError } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    if (updateError) {
      setPasswordError(updateError.message);
      setChangingPassword(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password changed successfully! 🔐");
    setChangingPassword(false);
  }

  // -----------------------------
  // LOG OUT
  // -----------------------------

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setEmailError(
        "We couldn't log you out. Please try again."
      );
      setLoggingOut(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  // -----------------------------
  // DELETE ACCOUNT
  // -----------------------------

  function openDeleteConfirmation() {
    setShowDeleteConfirmation(true);
    setDeleteConfirmation("");
    setDeleteError("");
  }

  function cancelDelete() {
    setShowDeleteConfirmation(false);
    setDeleteConfirmation("");
    setDeleteError("");
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== "DELETE") {
      setDeleteError(
        'Type "DELETE" exactly to confirm account deletion.'
      );
      return;
    }

    setDeletingAccount(true);
    setDeleteError("");

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(
          data.error ??
            "We couldn't delete your account. Please try again."
        );
        setDeletingAccount(false);
        return;
      }

      // Clear the deleted account's browser session.
      await supabase.auth.signOut();

      // Return to the Reel Talk homepage.
      router.replace("/");
      router.refresh();
    } catch {
      setDeleteError(
        "Something went wrong while deleting your account. Please try again."
      );
      setDeletingAccount(false);
    }
  }

  // -----------------------------
  // PAGE
  // -----------------------------

  return (
    <div className="space-y-8">
      {/* PROFILE */}
      <section className="relative rounded-3xl border border-[#3A3432] bg-[#211D1C] p-8 shadow-xl">
        <div className="absolute -top-3 left-10 h-7 w-24 -rotate-3 bg-[#D9B7AD]/60" />

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8A0A8]">
            Profile
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Your Reel Talk identity
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#B8AEA8]">
            This is how you'll appear around Reel Talk.
          </p>
        </div>

        <form
          onSubmit={handleSaveProfile}
          className="mt-8 space-y-6"
        >
          <div>
            <label
              htmlFor="displayName"
              className="text-sm font-semibold"
            >
              Display Name
            </label>

            <p className="mt-1 text-xs text-[#817774]">
              Your name as other people will see it.
            </p>

            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(event) =>
                setDisplayName(event.target.value)
              }
              placeholder="Nico"
              maxLength={50}
              className="mt-3 w-full rounded-xl border border-[#3A3432] bg-[#151313] px-4 py-3 text-[#F5EEE6] outline-none transition placeholder:text-[#716866] focus:border-[#E8A0A8]"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="text-sm font-semibold"
            >
              Username
            </label>

            <p className="mt-1 text-xs text-[#817774]">
              Your unique Reel Talk username.
            </p>

            <div className="relative mt-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#817774]">
                @
              </span>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="nicoj"
                maxLength={20}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-xl border border-[#3A3432] bg-[#151313] py-3 pl-9 pr-4 text-[#F5EEE6] outline-none transition placeholder:text-[#716866] focus:border-[#E8A0A8]"
              />
            </div>

            <p className="mt-2 text-xs text-[#817774]">
              3–20 characters. Letters, numbers, and underscores
              only.
            </p>
          </div>

          {profileError && (
            <div className="rounded-xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-4">
              <p className="text-sm text-[#F2B6BD]">
                {profileError}
              </p>
            </div>
          )}

          {profileMessage && (
            <div className="rounded-xl border border-[#F1DFCC]/20 bg-[#F1DFCC]/10 p-4">
              <p className="text-sm text-[#F1DFCC]">
                {profileMessage}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-xl bg-[#E8A0A8] px-6 py-3 font-bold text-[#151313] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      {/* ACCOUNT & SECURITY */}
      <section className="rounded-3xl border border-[#3A3432] bg-[#211D1C] p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8A0A8]">
            Account & Security
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Keep your account yours
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#B8AEA8]">
            Manage your login and account security.
          </p>
        </div>

        {/* CURRENT EMAIL */}
        <div className="mt-8">
          <p className="text-sm font-semibold">
            Current Email
          </p>

          <div className="mt-3 rounded-xl border border-[#3A3432] bg-[#191615] px-4 py-3">
            <p className="break-all text-sm text-[#B8AEA8]">
              {email}
            </p>
          </div>
        </div>

        {/* CHANGE EMAIL */}
        <form
          onSubmit={handleChangeEmail}
          className="mt-7"
        >
          <label
            htmlFor="newEmail"
            className="text-sm font-semibold"
          >
            Change Email
          </label>

          <p className="mt-1 text-xs leading-5 text-[#817774]">
            Enter the new email address you'd like to use for
            Reel Talk.
          </p>

          <input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(event) =>
              setNewEmail(event.target.value)
            }
            placeholder="newemail@example.com"
            autoComplete="email"
            required
            className="mt-3 w-full rounded-xl border border-[#3A3432] bg-[#151313] px-4 py-3 text-[#F5EEE6] outline-none transition placeholder:text-[#716866] focus:border-[#E8A0A8]"
          />

          {emailError && (
            <div className="mt-4 rounded-xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-4">
              <p className="text-sm text-[#F2B6BD]">
                {emailError}
              </p>
            </div>
          )}

          {emailMessage && (
            <div className="mt-4 rounded-xl border border-[#F1DFCC]/20 bg-[#F1DFCC]/10 p-4">
              <p className="text-sm leading-6 text-[#F1DFCC]">
                {emailMessage}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={changingEmail}
            className="mt-5 rounded-xl border border-[#E8A0A8]/50 px-5 py-2.5 text-sm font-semibold text-[#E8A0A8] transition hover:bg-[#E8A0A8]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changingEmail ? "Sending..." : "Change Email"}
          </button>
        </form>

        {/* CHANGE PASSWORD */}
        <form
          onSubmit={handleChangePassword}
          className="mt-10 border-t border-dashed border-[#4A4240] pt-8"
        >
          <h3 className="font-semibold">
            Change Password
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#817774]">
            Verify your current password, then choose a new one.
          </p>

          <div className="mt-5">
            <label
              htmlFor="currentPassword"
              className="text-sm font-semibold"
            >
              Current Password
            </label>

            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              placeholder="Enter your current password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-[#3A3432] bg-[#151313] px-4 py-3 text-[#F5EEE6] outline-none transition placeholder:text-[#716866] focus:border-[#E8A0A8]"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="newPassword"
              className="text-sm font-semibold"
            >
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
              className="mt-2 w-full rounded-xl border border-[#3A3432] bg-[#151313] px-4 py-3 text-[#F5EEE6] outline-none transition placeholder:text-[#716866] focus:border-[#E8A0A8]"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Enter the new password again"
              autoComplete="new-password"
              minLength={8}
              required
              className="mt-2 w-full rounded-xl border border-[#3A3432] bg-[#151313] px-4 py-3 text-[#F5EEE6] outline-none transition placeholder:text-[#716866] focus:border-[#E8A0A8]"
            />
          </div>

          {passwordError && (
            <div className="mt-4 rounded-xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-4">
              <p className="text-sm text-[#F2B6BD]">
                {passwordError}
              </p>
            </div>
          )}

          {passwordMessage && (
            <div className="mt-4 rounded-xl border border-[#F1DFCC]/20 bg-[#F1DFCC]/10 p-4">
              <p className="text-sm text-[#F1DFCC]">
                {passwordMessage}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="mt-5 rounded-xl border border-[#E8A0A8]/50 px-5 py-2.5 text-sm font-semibold text-[#E8A0A8] transition hover:bg-[#E8A0A8]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changingPassword
              ? "Changing..."
              : "Change Password"}
          </button>
        </form>

        {/* LOG OUT */}
        <div className="mt-10 border-t border-dashed border-[#4A4240] pt-7">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="font-semibold">
                Log out
              </p>

              <p className="mt-1 text-sm text-[#817774]">
                Sign out of Reel Talk on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="shrink-0 rounded-xl border border-[#E8A0A8]/50 px-5 py-2.5 text-sm font-semibold text-[#E8A0A8] transition hover:bg-[#E8A0A8]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Log Out"}
            </button>
          </div>
        </div>
      </section>

      {/* DANGER ZONE */}
      <section className="rounded-3xl border border-red-900/60 bg-[#211D1C] p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
          Danger Zone
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Delete your account
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#B8AEA8]">
          Permanently delete your Reel Talk account. This action
          cannot be undone.
        </p>

        {!showDeleteConfirmation ? (
          <button
            type="button"
            onClick={openDeleteConfirmation}
            className="mt-6 rounded-xl border border-red-800 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-950/40"
          >
            Delete Account
          </button>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleDeleteAccount();
            }}
            className="mt-7 rounded-2xl border border-red-900/60 bg-red-950/10 p-6"
          >
            <p className="font-semibold text-red-300">
              Are you absolutely sure?
            </p>

            <p className="mt-2 text-sm leading-6 text-[#B8AEA8]">
              This permanently deletes your Reel Talk account.
              Type{" "}
              <span className="font-bold text-[#F5EEE6]">
                DELETE
              </span>{" "}
              below to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => {
                setDeleteConfirmation(event.target.value);
                setDeleteError("");
              }}
              placeholder="Type DELETE"
              autoComplete="off"
              spellCheck={false}
              disabled={deletingAccount}
              className="mt-5 w-full rounded-xl border border-red-900/60 bg-[#151313] px-4 py-3 text-[#F5EEE6] outline-none transition placeholder:text-[#716866] focus:border-red-500 disabled:opacity-50"
            />

            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/30 p-4">
                <p className="text-sm text-red-300">
                  {deleteError}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  deleteConfirmation !== "DELETE" ||
                  deletingAccount
                }
                className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deletingAccount
                  ? "Deleting Account..."
                  : "Permanently Delete Account"}
              </button>

              <button
                type="button"
                onClick={cancelDelete}
                disabled={deletingAccount}
                className="rounded-xl border border-[#4A4240] px-5 py-2.5 text-sm font-semibold text-[#B8AEA8] transition hover:border-[#817774] hover:text-[#F5EEE6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* SCRAPBOOK NOTE */}
      <div className="text-center">
        <p className="-rotate-1 text-xs italic text-[#817774]">
          your movies, your journals, your little corner of the
          credits ♡
        </p>
      </div>
    </div>
  );
}