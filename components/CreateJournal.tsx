"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateJournal() {
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<
    "private" | "shared"
  >("private");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("Give your journal a name first.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setErrorMessage(
          "You need to be logged in to create a journal."
        );
        return;
      }

      const { error } = await supabase
        .from("journals")
        .insert({
          owner_id: user.id,
          name: trimmedName,
          description: description.trim() || null,
          visibility,
          cover_style: null,
        });

      if (error) {
        throw error;
      }

      // Reset the form.
      setName("");
      setDescription("");
      setVisibility("private");
      setIsOpen(false);

      // Refresh the server page so the new notebook appears.
      router.refresh();
    } catch (error) {
      console.error("Could not create journal:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your journal."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-fit rounded-xl bg-[#E8A0A8] px-5 py-3 font-bold text-[#151313] transition hover:opacity-90"
      >
        + Create Journal
      </button>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#3A3432] bg-[#211D1C] p-5 shadow-xl sm:w-[400px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8A0A8]">
            New Notebook
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#F5EEE6]">
            Create a Journal
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setErrorMessage("");
          }}
          className="text-xl text-[#817774] transition hover:text-[#F5EEE6]"
          aria-label="Close create journal form"
        >
          ×
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-5"
      >
        {/* JOURNAL NAME */}
        <div>
          <label
            htmlFor="journal-name"
            className="text-sm font-semibold text-[#F5EEE6]"
          >
            Journal Name
          </label>

          <input
            id="journal-name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Movie Nights"
            maxLength={60}
            className="mt-2 w-full rounded-xl border border-[#3A3432] bg-[#151313] px-4 py-3 text-[#F5EEE6] outline-none transition placeholder:text-[#6F6662] focus:border-[#E8A0A8]"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label
            htmlFor="journal-description"
            className="text-sm font-semibold text-[#F5EEE6]"
          >
            Description{" "}
            <span className="font-normal text-[#817774]">
              (optional)
            </span>
          </label>

          <textarea
            id="journal-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Movies for cozy nights, rewatches, and comfort picks..."
            maxLength={200}
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-[#3A3432] bg-[#151313] px-4 py-3 text-[#F5EEE6] outline-none transition placeholder:text-[#6F6662] focus:border-[#E8A0A8]"
          />
        </div>

        {/* VISIBILITY */}
        <div>
          <p className="text-sm font-semibold text-[#F5EEE6]">
            Journal Type
          </p>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setVisibility("private")
              }
              className={`rounded-xl border p-3 text-left transition ${
                visibility === "private"
                  ? "border-[#E8A0A8] bg-[#E8A0A8]/10"
                  : "border-[#3A3432] bg-[#151313] hover:border-[#665D59]"
              }`}
            >
              <span className="block font-bold">
                🔒 Private
              </span>

              <span className="mt-1 block text-xs text-[#817774]">
                Just for you
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setVisibility("shared")
              }
              className={`rounded-xl border p-3 text-left transition ${
                visibility === "shared"
                  ? "border-[#E8A0A8] bg-[#E8A0A8]/10"
                  : "border-[#3A3432] bg-[#151313] hover:border-[#665D59]"
              }`}
            >
              <span className="block font-bold">
                👥 Shared
              </span>

              <span className="mt-1 block text-xs text-[#817774]">
                Invite friends later
              </span>
            </button>
          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <p className="rounded-xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-3 text-sm text-[#F2B6BD]">
            {errorMessage}
          </p>
        )}

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-xl bg-[#E8A0A8] px-4 py-3 font-bold text-[#151313] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Creating..."
              : "Create Journal"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setErrorMessage("");
            }}
            disabled={isSaving}
            className="rounded-xl border border-[#3A3432] px-4 py-3 font-semibold text-[#B8AEA8] transition hover:border-[#665D59] hover:text-[#F5EEE6]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}