"use client";

import { useState, useTransition } from "react";
import { submitRSVP } from "../actions";

export default function RSVPForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [numChildren, setNumChildren] = useState(0);
  const [childAges, setChildAges] = useState<string[]>([]);

  function updateNumChildren(n: number) {
    const clamped = Math.max(0, Math.min(10, n));
    setNumChildren(clamped);
    setChildAges((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped) next.push("");
      return next;
    });
  }

  function updateAge(i: number, value: string) {
    setChildAges((prev) => prev.map((a, idx) => (idx === i ? value : a)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("numChildren", String(numChildren));
    formData.set("childAges", childAges.filter((a) => a !== "").join(", "));
    startTransition(async () => {
      const result = await submitRSVP(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Something went wrong");
      }
    });
  }

  if (submitted) {
    return (
      <div className="glass-card p-5 sm:p-8 md:p-12 text-center max-w-lg mx-auto">
        <div className="text-6xl mb-4 animate-sail inline-block">
          &#9973;
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">
          {attending === "yes"
            ? "See you at the beach!"
            : "We'll miss you!"}
        </h3>
        <p className="text-amber-100">
          {attending === "yes"
            ? "Your RSVP has been received! Check your email for a calendar invite. See you at the party!"
            : "Thanks for letting us know. Maybe next time!"}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card p-5 sm:p-8 md:p-12 max-w-lg mx-auto space-y-5 sm:space-y-6"
    >
      <div className="text-center mb-2">
        <h3 className="text-2xl font-bold text-white mb-1">RSVP</h3>
        <p className="text-amber-100/80 text-sm">
          Confirm your spot at the celebration
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-amber-50 mb-1.5">
          Your name
        </label>
        <input
          type="text"
          name="guestName"
          required
          className="beach-input"
          placeholder="Your name"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-amber-50 mb-1.5">
          Your email
        </label>
        <input
          type="email"
          name="email"
          required
          className="beach-input"
          placeholder="you@example.com"
        />
        <p className="text-xs text-amber-100/40 mt-1">
          We&apos;ll send you a calendar invite
        </p>
      </div>

      {/* Attending? */}
      <div>
        <label className="block text-sm font-medium text-amber-50 mb-2">
          Will you join the celebration?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAttending("yes")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              attending === "yes"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                : "bg-amber-950/50 text-amber-100/80 border border-amber-500/20 hover:border-amber-500/40"
            }`}
          >
            Count me in!
          </button>
          <button
            type="button"
            onClick={() => setAttending("no")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              attending === "no"
                ? "bg-rose-600/80 text-white shadow-lg shadow-rose-500/20"
                : "bg-amber-950/50 text-amber-100/80 border border-amber-500/20 hover:border-amber-500/40"
            }`}
          >
            Can&apos;t make it
          </button>
        </div>
        <input type="hidden" name="attending" value={attending} />
      </div>

      {attending === "yes" && (
        <>
          {/* Number of adults */}
          <div>
            <label className="block text-sm font-medium text-amber-50 mb-1.5">
              Number of adults
            </label>
            <input
              type="number"
              name="numAdults"
              min="1"
              max="20"
              defaultValue="1"
              required
              className="beach-input"
            />
          </div>

          {/* Number of children */}
          <div>
            <label className="block text-sm font-medium text-amber-50 mb-1.5">
              Number of children
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={numChildren}
              onChange={(e) => updateNumChildren(parseInt(e.target.value) || 0)}
              className="beach-input"
            />
          </div>

          {/* Dynamic age fields */}
          {numChildren > 0 && (
            <div>
              <label className="block text-sm font-medium text-amber-50 mb-1.5">
                {numChildren === 1 ? "Age of child" : "Ages of children"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {childAges.map((age, i) => (
                  <input
                    key={i}
                    type="number"
                    min="0"
                    max="99"
                    value={age}
                    onChange={(e) => updateAge(i, e.target.value)}
                    className="beach-input"
                    placeholder={`Child ${i + 1}`}
                    aria-label={`Age of child ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Dietary requirements */}
          <div>
            <label className="block text-sm font-medium text-amber-50 mb-1.5">
              Any dietary requirements?
            </label>
            <input
              type="text"
              name="dietary"
              className="beach-input"
              placeholder="e.g. vegetarian, gluten-free..."
            />
          </div>
        </>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-amber-50 mb-1.5">
          Message for Nicola (optional)
        </label>
        <textarea
          name="message"
          rows={3}
          className="beach-input resize-none"
          placeholder="Happy birthday, Nicola!"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs break-all">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || attending === ""}
        className="w-full py-3.5 rounded-xl font-bold text-white transition-all
          bg-gradient-to-r from-amber-600 to-orange-600
          hover:from-amber-500 hover:to-orange-500
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40
          active:scale-[0.98]"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </span>
        ) : (
          "Send RSVP"
        )}
      </button>
    </form>
  );
}
