"use client";

import { useEffect, useState } from "react";
import JournalTicket from "@/components/JournalTicket";
import DatePicker from "@/components/DatePicker";
import { createClient } from "@/lib/supabase/client";

type TitleActionsProps = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  posterUrl: string | null;
  year: string;
};

type Journal = {
  id: number;
  name: string;
  description: string | null;
  visibility: string;
  owner_id: string;
};

const tagOptions = [
  "Comfort",
  "Funny",
  "Emotional",
  "Heartwarming",
  "Sad",
  "Scary",
  "Romantic",
  "Mind-Bending",
  "Nostalgic",
  "Intense",
  "Cozy",
  "Weird",
];

export default function TitleActions({
  tmdbId,
  mediaType,
  title,
  posterPath,
  posterUrl,
  year,
}: TitleActionsProps) {
  const supabase = createClient();

  const [status, setStatus] = useState<string | null>(null);

  const [watchedDate, setWatchedDate] =
    useState<string>("");

  const [watchedTime, setWatchedTime] =
    useState<string>("");

  const [rating, setRating] =
    useState<number>(0);

  const [selectedTags, setSelectedTags] =
    useState<string[]>([]);

  const [customTag, setCustomTag] =
    useState<string>("");

  const [journalNote, setJournalNote] =
    useState<string>("");

  const [ticketCreated, setTicketCreated] =
    useState<boolean>(false);

  const [saving, setSaving] =
    useState<boolean>(false);

  const [saveError, setSaveError] =
    useState<string>("");

  const [statusSaving, setStatusSaving] =
    useState<boolean>(false);

  const [statusMessage, setStatusMessage] =
    useState<string>("");

  const [statusError, setStatusError] =
    useState<string>("");

  const [statusLoading, setStatusLoading] =
    useState<boolean>(true);

  /*
    JOURNAL PICKER
  */

  const [journals, setJournals] =
    useState<Journal[]>([]);

  const [journalsLoading, setJournalsLoading] =
    useState<boolean>(true);

  const [selectedJournalId, setSelectedJournalId] =
    useState<number | null>(null);

  const [showCreateJournal, setShowCreateJournal] =
    useState<boolean>(false);

  const [newJournalName, setNewJournalName] =
    useState<string>("");

  const [newJournalDescription, setNewJournalDescription] =
    useState<string>("");

  const [newJournalVisibility, setNewJournalVisibility] =
    useState<"private" | "shared">("private");

  const [creatingJournal, setCreatingJournal] =
    useState<boolean>(false);

  const [createJournalError, setCreateJournalError] =
    useState<string>("");

  /*
    Load the saved title status and its journal information.
  */

  useEffect(() => {
    let cancelled = false;

    async function loadSavedStatus() {
      setStatusLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          return;
        }

        const {
          data: existingEntries,
          error: existingError,
        } = await supabase
          .from("journal_entries")
          .select(
            "status, watched_date, watched_time, rating, tags, journal_note, journal_id"
          )
          .eq("user_id", user.id)
          .eq("tmdb_id", tmdbId)
          .eq("media_type", mediaType)
          .order("created_at", {
            ascending: false,
          })
          .limit(1);

        if (existingError) {
          throw existingError;
        }

        if (
          !cancelled &&
          existingEntries &&
          existingEntries.length > 0
        ) {
          const entry = existingEntries[0];

          setStatus(entry.status);

          if (entry.status === "finished") {
            setWatchedDate(
              entry.watched_date ?? ""
            );

            setWatchedTime(
              entry.watched_time
                ? entry.watched_time.slice(0, 5)
                : ""
            );

            setRating(
              entry.rating ?? 0
            );

            setSelectedTags(
              entry.tags ?? []
            );

            setJournalNote(
              entry.journal_note ?? ""
            );

            setSelectedJournalId(
              entry.journal_id ?? null
            );
          }
        }
      } catch (error) {
        console.error(
          "Could not load saved status:",
          error
        );
      } finally {
        if (!cancelled) {
          setStatusLoading(false);
        }
      }
    }

    loadSavedStatus();

    return () => {
      cancelled = true;
    };
  }, [tmdbId, mediaType]);

  /*
    Load all journals the user can see.

    Our Supabase RLS policies decide which journals
    belong to the user or are shared with them.
  */

  useEffect(() => {
    let cancelled = false;

    async function loadJournals() {
      setJournalsLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          if (!cancelled) {
            setJournals([]);
          }

          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("journals")
          .select(
            "id, name, description, visibility, owner_id"
          )
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setJournals(data ?? []);
        }
      } catch (error) {
        console.error(
          "Could not load journals:",
          error
        );

        if (!cancelled) {
          setJournals([]);
        }
      } finally {
        if (!cancelled) {
          setJournalsLoading(false);
        }
      }
    }

    loadJournals();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
    Gets the logged-in user and checks whether this
    movie/show already has a row in journal_entries.
  */

  async function getUserAndExistingEntry() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error(
        "You need to log in before changing a title's status."
      );
    }

    const {
      data: existingEntries,
      error: existingError,
    } = await supabase
      .from("journal_entries")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("tmdb_id", tmdbId)
      .eq("media_type", mediaType)
      .order("created_at", {
        ascending: false,
      })
      .limit(1);

    if (existingError) {
      throw existingError;
    }

    return {
      user,
      existingEntry:
        existingEntries &&
        existingEntries.length > 0
          ? existingEntries[0]
          : null,
    };
  }

  /*
    Used for Plan to Watch and Currently Watching.

    Moving a title away from Finished also removes
    it from its journal because it is no longer a
    finished ticket.
  */

  async function saveSimpleStatus(
    newStatus: "planned" | "watching"
  ) {
    setStatusSaving(true);
    setStatusError("");
    setStatusMessage("");
    setSaveError("");

    try {
      const { user, existingEntry } =
        await getUserAndExistingEntry();

      if (existingEntry) {
        const { error: updateError } =
          await supabase
            .from("journal_entries")
            .update({
              status: newStatus,
              watched_date: null,
              watched_time: null,
              rating: null,
              tags: [],
              journal_note: null,
              journal_id: null,
            })
            .eq("id", existingEntry.id)
            .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } =
          await supabase
            .from("journal_entries")
            .insert({
              user_id: user.id,
              tmdb_id: tmdbId,
              media_type: mediaType,
              title,
              poster_path: posterPath,
              year,
              status: newStatus,
              watched_date: null,
              watched_time: null,
              rating: null,
              tags: [],
              journal_note: null,
              journal_id: null,
            });

        if (insertError) {
          throw insertError;
        }
      }

      setStatus(newStatus);
      setTicketCreated(false);

      setWatchedDate("");
      setWatchedTime("");
      setRating(0);
      setSelectedTags([]);
      setJournalNote("");
      setSelectedJournalId(null);

      setStatusMessage(
        newStatus === "planned"
          ? "✓ Added to Watchlist"
          : "✓ Marked as Currently Watching"
      );
    } catch (error) {
      if (error instanceof Error) {
        setStatusError(error.message);
      } else {
        setStatusError(
          "Something went wrong while changing the status."
        );
      }
    } finally {
      setStatusSaving(false);
    }
  }

  async function handlePlanToWatch() {
    await saveSimpleStatus("planned");
  }

  async function handleCurrentlyWatching() {
    await saveSimpleStatus("watching");
  }

  function handleFinished() {
    setStatus("finished");
    setTicketCreated(false);
    setSaveError("");
    setStatusError("");
    setStatusMessage("");
  }

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(
        selectedTags.filter(
          (selectedTag) =>
            selectedTag !== tag
        )
      );
    } else {
      setSelectedTags([
        ...selectedTags,
        tag,
      ]);
    }
  }

  function addCustomTag() {
    const cleanedTag = customTag.trim();

    if (cleanedTag === "") {
      return;
    }

    const alreadyExists =
      selectedTags.some(
        (tag) =>
          tag.toLowerCase() ===
          cleanedTag.toLowerCase()
      );

    if (!alreadyExists) {
      setSelectedTags([
        ...selectedTags,
        cleanedTag,
      ]);
    }

    setCustomTag("");
  }

  function removeTag(tagToRemove: string) {
    setSelectedTags(
      selectedTags.filter(
        (tag) => tag !== tagToRemove
      )
    );
  }

  /*
    Create a journal directly from the movie page.

    After it is created, it is automatically selected
    for this ticket.
  */

  async function handleCreateJournal() {
    const cleanedName =
      newJournalName.trim();

    if (cleanedName === "") {
      setCreateJournalError(
        "Give your journal a name first."
      );

      return;
    }

    setCreatingJournal(true);
    setCreateJournalError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "You need to log in before creating a journal."
        );
      }

      const {
        data: newJournal,
        error: insertError,
      } = await supabase
        .from("journals")
        .insert({
          owner_id: user.id,
          name: cleanedName,
          description:
            newJournalDescription.trim() === ""
              ? null
              : newJournalDescription.trim(),
          visibility:
            newJournalVisibility,
        })
        .select(
          "id, name, description, visibility, owner_id"
        )
        .single();

      if (insertError) {
        throw insertError;
      }

      setJournals((currentJournals) => [
        newJournal,
        ...currentJournals,
      ]);

      setSelectedJournalId(
        newJournal.id
      );

      setNewJournalName("");
      setNewJournalDescription("");
      setNewJournalVisibility("private");
      setShowCreateJournal(false);
    } catch (error) {
      if (error instanceof Error) {
        setCreateJournalError(
          error.message
        );
      } else {
        setCreateJournalError(
          "Something went wrong while creating your journal."
        );
      }
    } finally {
      setCreatingJournal(false);
    }
  }

  /*
    Finishing a title updates the same database row
    instead of creating another copy.

    selectedJournalId is saved as journal_id.
    If it is null, the ticket stays unfiled.
  */

  async function handleCreateTicket() {
    if (watchedDate === "") {
      return;
    }

    setSaving(true);
    setSaveError("");
    setStatusError("");
    setStatusMessage("");

    try {
      const { user, existingEntry } =
        await getUserAndExistingEntry();

      const finishedValues = {
        status: "finished",
        watched_date: watchedDate,
        watched_time:
          watchedTime === ""
            ? null
            : watchedTime,
        rating,
        tags: selectedTags,
        journal_note:
          journalNote.trim() === ""
            ? null
            : journalNote.trim(),
        journal_id: selectedJournalId,
      };

      if (existingEntry) {
        const { error: updateError } =
          await supabase
            .from("journal_entries")
            .update(finishedValues)
            .eq("id", existingEntry.id)
            .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } =
          await supabase
            .from("journal_entries")
            .insert({
              user_id: user.id,
              tmdb_id: tmdbId,
              media_type: mediaType,
              title,
              poster_path: posterPath,
              year,
              ...finishedValues,
            });

        if (insertError) {
          throw insertError;
        }
      }

      setStatus("finished");
      setTicketCreated(true);
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError(
          "Something went wrong while saving your journal entry."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8">
      {/* STATUS BUTTONS */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePlanToWatch}
          disabled={
            statusSaving ||
            statusLoading
          }
          className={`rounded-xl px-5 py-3 font-semibold transition ${
            status === "planned"
              ? "bg-[#F1DFCC] text-[#211B19]"
              : "bg-[#242020] hover:bg-[#332D2D]"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {statusLoading
            ? "Loading..."
            : status === "planned"
              ? "✓ Plan to Watch"
              : "+ Plan to Watch"}
        </button>

        <button
          type="button"
          onClick={handleCurrentlyWatching}
          disabled={
            statusSaving ||
            statusLoading
          }
          className={`rounded-xl px-5 py-3 font-semibold transition ${
            status === "watching"
              ? "bg-[#F1DFCC] text-[#211B19]"
              : "bg-[#242020] hover:bg-[#332D2D]"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {statusLoading
            ? "Loading..."
            : status === "watching"
              ? "✓ Currently Watching"
              : "Currently Watching"}
        </button>

        <button
          type="button"
          onClick={handleFinished}
          disabled={
            statusSaving ||
            statusLoading
          }
          className={`rounded-xl px-5 py-3 font-semibold transition ${
            status === "finished"
              ? "bg-[#F1DFCC] text-[#211B19]"
              : "bg-[#E8A0A8] text-[#151313] hover:opacity-90"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {statusLoading
            ? "Loading..."
            : status === "finished"
              ? "✓ Finished"
              : "Finished"}
        </button>
      </div>

      {/* STATUS MESSAGE */}
      {statusMessage && (
        <div className="mt-4 rounded-xl border border-[#F1DFCC]/20 bg-[#F1DFCC]/10 p-4">
          <p className="text-sm text-[#F1DFCC]">
            {statusMessage}
          </p>
        </div>
      )}

      {/* STATUS ERROR */}
      {statusError && (
        <div className="mt-4 rounded-xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-4">
          <p className="text-sm text-[#F2B6BD]">
            {statusError}
          </p>
        </div>
      )}

      {/* CURRENT STATUS */}
      {status &&
        status !== "finished" && (
          <p className="mt-4 text-sm text-[#B8AEA8]">
            Status:{" "}
            {status === "planned"
              ? "Plan to Watch"
              : "Currently Watching"}
          </p>
        )}

      {/* FINISHED JOURNAL FORM */}
      {status === "finished" &&
        !ticketCreated && (
          <div className="mt-6 rounded-2xl bg-[#242020] p-6">
            {/* HEADER */}
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8A0A8]">
              Journal Entry
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Add this one to the scrapbook
            </h2>

            <p className="mt-2 text-sm text-[#B8AEA8]">
              Add the little details you want
              to remember.
            </p>

            {/* DATE */}
            <div className="mt-6">
              <h3 className="mb-3 font-semibold">
                When did you watch it?
              </h3>

              <DatePicker
                selectedDate={watchedDate}
                onDateChange={setWatchedDate}
              />
            </div>

            {/* SELECTED DATE */}
            {watchedDate && (
              <p className="mt-3 text-sm text-[#B8AEA8]">
                Selected:{" "}
                <span className="font-semibold text-[#F5EEE6]">
                  {new Date(
                    `${watchedDate}T00:00:00`
                  ).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </span>
              </p>
            )}

            {/* TIME */}
            <div className="mt-6">
              <label
                htmlFor="watched-time"
                className="text-sm font-semibold"
              >
                Time Watched{" "}
                <span className="font-normal text-[#B8AEA8]">
                  optional
                </span>
              </label>

              <input
                id="watched-time"
                type="time"
                value={watchedTime}
                onChange={(event) =>
                  setWatchedTime(
                    event.target.value
                  )
                }
                className="mt-2 block w-full rounded-xl border border-[#3A3432] bg-[#1B1818] px-4 py-3 text-[#F5EEE6] outline-none transition focus:border-[#E8A0A8]"
              />
            </div>

            {/* RATING */}
            <div className="mt-8">
              <h3 className="font-semibold">
                Your Rating
              </h3>

              <p className="mt-1 text-sm text-[#B8AEA8]">
                Drag the slider to rate it.
              </p>

              <div className="mt-6 flex flex-col items-center">
                {/* BIG STAR */}
                <div className="h-52 w-52">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full"
                    aria-label={`${rating.toFixed(
                      1
                    )} out of 5 stars`}
                  >
                    <defs>
                      <clipPath id="rating-star-shape">
                        <path d="M50 5 L61 37 L95 38 L68 58 L77 91 L50 72 L23 91 L32 58 L5 38 L39 37 Z" />
                      </clipPath>
                    </defs>

                    {/* EMPTY STAR */}
                    <path
                      d="M50 5 L61 37 L95 38 L68 58 L77 91 L50 72 L23 91 L32 58 L5 38 L39 37 Z"
                      fill="#514947"
                    />

                    {/* FILLED STAR */}
                    <rect
                      x="0"
                      y="0"
                      width={
                        (rating / 5) * 100
                      }
                      height="100"
                      fill="#E8A0A8"
                      clipPath="url(#rating-star-shape)"
                    />

                    {/* STAR OUTLINE */}
                    <path
                      d="M50 5 L61 37 L95 38 L68 58 L77 91 L50 72 L23 91 L32 58 L5 38 L39 37 Z"
                      fill="none"
                      stroke="#6A605D"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* RATING NUMBER */}
                <div className="mt-3 text-center">
                  <span className="text-4xl font-bold text-[#F5EEE6]">
                    {rating.toFixed(1)}
                  </span>

                  <span className="ml-2 text-lg text-[#817774]">
                    / 5
                  </span>
                </div>

                {/* SLIDER */}
                <div className="mt-7 w-full max-w-lg">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(event) =>
                      setRating(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    aria-label="Your rating"
                    className="w-full cursor-pointer accent-[#E8A0A8]"
                  />

                  <div className="mt-2 flex justify-between text-sm text-[#817774]">
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAGS */}
            <div className="mt-8">
              <h3 className="font-semibold">
                Tags
              </h3>

              <p className="mt-1 text-sm text-[#B8AEA8]">
                Pick some suggestions or
                make your own.
              </p>

              {/* SUGGESTED TAGS */}
              <div className="mt-4 flex flex-wrap gap-2">
                {tagOptions.map((tag) => {
                  const selected =
                    selectedTags.includes(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        toggleTag(tag)
                      }
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        selected
                          ? "border-[#E8A0A8] bg-[#E8A0A8] text-[#151313]"
                          : "border-[#4A4240] bg-[#1B1818] text-[#D6CDC7] hover:border-[#E8A0A8]"
                      }`}
                    >
                      {selected
                        ? "✓ "
                        : ""}
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* CUSTOM TAG */}
              <div className="mt-5 flex max-w-md gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(event) =>
                    setCustomTag(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      event.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="Make your own tag..."
                  className="min-w-0 flex-1 rounded-xl border border-[#3A3432] bg-[#1B1818] px-4 py-3 text-sm text-[#F5EEE6] outline-none placeholder:text-[#716866] focus:border-[#E8A0A8]"
                />

                <button
                  type="button"
                  onClick={addCustomTag}
                  className="rounded-xl bg-[#F1DFCC] px-4 py-3 text-sm font-bold text-[#211B19] transition hover:opacity-90"
                >
                  + Add
                </button>
              </div>

              {/* SELECTED TAGS */}
              {selectedTags.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#817774]">
                    Your Tags
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTags.map(
                      (tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            removeTag(tag)
                          }
                          title="Click to remove"
                          className="-rotate-1 rounded-full bg-[#D9B7AD] px-3 py-1.5 text-sm font-semibold text-[#211B19] transition hover:line-through"
                        >
                          {tag} ×
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* JOURNAL NOTE */}
            <div className="mt-8">
              <label
                htmlFor="journal-note"
                className="font-semibold"
              >
                Journal Note
              </label>

              <p className="mt-1 text-sm text-[#B8AEA8]">
                What do you want to
                remember about it?
              </p>

              <textarea
                id="journal-note"
                value={journalNote}
                onChange={(event) =>
                  setJournalNote(
                    event.target.value
                  )
                }
                placeholder="That ending... I need to talk about it."
                rows={5}
                className="mt-3 w-full resize-none rounded-xl border border-[#3A3432] bg-[#1B1818] px-4 py-3 leading-6 text-[#F5EEE6] outline-none placeholder:text-[#716866] focus:border-[#E8A0A8]"
              />
            </div>

            {/* ADD TO JOURNAL */}
            <div className="mt-10 border-t border-[#3A3432] pt-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8A0A8]">
                    Add to a Journal
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    Where should this ticket live?
                  </h3>

                  <p className="mt-1 text-sm text-[#B8AEA8]">
                    Pick a notebook or leave it
                    unfiled for now.
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="text-3xl"
                >
                  📓
                </span>
              </div>

              {/* JOURNAL LIST */}
              <div className="mt-5 space-y-3">
                {journalsLoading ? (
                  <div className="rounded-xl border border-[#3A3432] bg-[#1B1818] px-4 py-4 text-sm text-[#B8AEA8]">
                    Loading your journals...
                  </div>
                ) : journals.length > 0 ? (
                  journals.map((journal) => {
                    const selected =
                      selectedJournalId ===
                      journal.id;

                    return (
                      <button
                        key={journal.id}
                        type="button"
                        onClick={() =>
                          setSelectedJournalId(
                            journal.id
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                          selected
                            ? "border-[#E8A0A8] bg-[#E8A0A8]/10"
                            : "border-[#3A3432] bg-[#1B1818] hover:border-[#6A605D]"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="text-xl"
                          >
                            {journal.visibility ===
                            "shared"
                              ? "👥"
                              : "📓"}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#F5EEE6]">
                              {journal.name}
                            </p>

                            <p className="mt-0.5 text-xs text-[#817774]">
                              {journal.visibility ===
                              "shared"
                                ? "Shared journal"
                                : "Private journal"}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-[#E8A0A8] bg-[#E8A0A8] text-[#151313]"
                              : "border-[#5B514E]"
                          }`}
                        >
                          {selected && (
                            <span className="text-sm font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-[#4A4240] bg-[#1B1818] px-5 py-5">
                    <p className="font-semibold">
                      No journals yet.
                    </p>

                    <p className="mt-1 text-sm text-[#B8AEA8]">
                      Make your first notebook
                      without leaving this movie.
                    </p>
                  </div>
                )}

                {/* LEAVE UNFILED */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedJournalId(null)
                  }
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                    selectedJournalId === null
                      ? "border-[#F1DFCC] bg-[#F1DFCC]/10"
                      : "border-[#3A3432] bg-[#1B1818] hover:border-[#6A605D]"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-[#F5EEE6]">
                      Leave unfiled
                    </p>

                    <p className="mt-0.5 text-xs text-[#817774]">
                      You can organize this ticket later.
                    </p>
                  </div>

                  <div
                    className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      selectedJournalId === null
                        ? "border-[#F1DFCC] bg-[#F1DFCC] text-[#151313]"
                        : "border-[#5B514E]"
                    }`}
                  >
                    {selectedJournalId ===
                      null && (
                      <span className="text-sm font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* CREATE JOURNAL BUTTON */}
              {!showCreateJournal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateJournal(true);
                    setCreateJournalError("");
                  }}
                  className="mt-4 w-full rounded-xl border border-dashed border-[#E8A0A8]/60 bg-[#E8A0A8]/5 px-5 py-4 text-left font-semibold text-[#E8A0A8] transition hover:bg-[#E8A0A8]/10"
                >
                  + Create New Journal
                </button>
              )}

              {/* INLINE CREATE JOURNAL */}
              {showCreateJournal && (
                <div className="mt-4 rounded-2xl border border-[#4A4240] bg-[#1B1818] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8A0A8]">
                        New Notebook
                      </p>

                      <h4 className="mt-1 text-lg font-bold">
                        Create a Journal 📓
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateJournal(false);
                        setCreateJournalError("");
                      }}
                      className="rounded-lg px-3 py-2 text-sm text-[#B8AEA8] transition hover:bg-[#2A2524] hover:text-[#F5EEE6]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="new-journal-name"
                      className="text-sm font-semibold"
                    >
                      Journal Name
                    </label>

                    <input
                      id="new-journal-name"
                      type="text"
                      value={newJournalName}
                      onChange={(event) =>
                        setNewJournalName(
                          event.target.value
                        )
                      }
                      placeholder="Horror Marathon"
                      maxLength={80}
                      className="mt-2 w-full rounded-xl border border-[#3A3432] bg-[#242020] px-4 py-3 text-[#F5EEE6] outline-none placeholder:text-[#716866] focus:border-[#E8A0A8]"
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="new-journal-description"
                      className="text-sm font-semibold"
                    >
                      Description{" "}
                      <span className="font-normal text-[#817774]">
                        optional
                      </span>
                    </label>

                    <textarea
                      id="new-journal-description"
                      value={
                        newJournalDescription
                      }
                      onChange={(event) =>
                        setNewJournalDescription(
                          event.target.value
                        )
                      }
                      placeholder="Late-night scary movie picks..."
                      rows={3}
                      className="mt-2 w-full resize-none rounded-xl border border-[#3A3432] bg-[#242020] px-4 py-3 text-[#F5EEE6] outline-none placeholder:text-[#716866] focus:border-[#E8A0A8]"
                    />
                  </div>

                  {/* VISIBILITY */}
                  <div className="mt-5">
                    <p className="text-sm font-semibold">
                      Visibility
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          setNewJournalVisibility(
                            "private"
                          )
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          newJournalVisibility ===
                          "private"
                            ? "border-[#E8A0A8] bg-[#E8A0A8]/10"
                            : "border-[#3A3432] bg-[#242020] hover:border-[#6A605D]"
                        }`}
                      >
                        <p className="font-semibold">
                          🔒 Private
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#817774]">
                          Just for your own movie
                          memories.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setNewJournalVisibility(
                            "shared"
                          )
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          newJournalVisibility ===
                          "shared"
                            ? "border-[#E8A0A8] bg-[#E8A0A8]/10"
                            : "border-[#3A3432] bg-[#242020] hover:border-[#6A605D]"
                        }`}
                      >
                        <p className="font-semibold">
                          👥 Shared
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#817774]">
                          We'll invite people to it
                          later.
                        </p>
                      </button>
                    </div>
                  </div>

                  {createJournalError && (
                    <div className="mt-4 rounded-xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-3">
                      <p className="text-sm text-[#F2B6BD]">
                        {createJournalError}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleCreateJournal
                    }
                    disabled={
                      creatingJournal ||
                      newJournalName.trim() === ""
                    }
                    className="mt-5 w-full rounded-xl bg-[#F1DFCC] px-5 py-3 font-bold text-[#211B19] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {creatingJournal
                      ? "Creating Journal..."
                      : "Create Journal"}
                  </button>
                </div>
              )}
            </div>

            {/* SAVE ERROR */}
            {saveError && (
              <div className="mt-6 rounded-xl border border-[#E8A0A8]/30 bg-[#E8A0A8]/10 p-4">
                <p className="text-sm text-[#F2B6BD]">
                  {saveError}
                </p>
              </div>
            )}

            {/* SAVE TICKET */}
            <button
              type="button"
              onClick={handleCreateTicket}
              disabled={
                watchedDate === "" ||
                saving
              }
              className="mt-8 w-full rounded-xl bg-[#E8A0A8] px-6 py-4 font-semibold text-[#151313] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? "Saving Ticket..."
                : selectedJournalId !== null
                  ? "Save to Journal 🎟️"
                  : "Save Ticket Unfiled 🎟️"}
            </button>
          </div>
        )}

      {/* CREATED TICKET */}
      {status === "finished" &&
        ticketCreated && (
          <div>
            {selectedJournalId !== null && (
              <div className="mb-5 rounded-xl border border-[#F1DFCC]/20 bg-[#F1DFCC]/10 p-4">
                <p className="text-sm text-[#F1DFCC]">
                  ✓ Ticket saved to{" "}
                  <span className="font-bold">
                    {journals.find(
                      (journal) =>
                        journal.id ===
                        selectedJournalId
                    )?.name ?? "your journal"}
                  </span>
                </p>
              </div>
            )}

            {selectedJournalId === null && (
              <div className="mb-5 rounded-xl border border-[#F1DFCC]/20 bg-[#F1DFCC]/10 p-4">
                <p className="text-sm text-[#F1DFCC]">
                  ✓ Ticket saved. It's unfiled
                  for now.
                </p>
              </div>
            )}

            <JournalTicket
              title={title}
              posterUrl={posterUrl}
              year={year}
              watchedDate={watchedDate}
              watchedTime={watchedTime}
              rating={rating}
              tags={selectedTags}
              journalNote={journalNote}
            />
          </div>
        )}
    </div>
  );
}