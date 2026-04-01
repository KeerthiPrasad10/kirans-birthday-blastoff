"use client";

import { useState, useTransition } from "react";
import { submitRSVP } from "../actions";

export default function RSVPForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [childNames, setChildNames] = useState([""]);

  function addChild() {
    setChildNames((prev) => [...prev, ""]);
  }

  function removeChild(index: number) {
    setChildNames((prev) => prev.filter((_, i) => i !== index));
  }

  function updateChild(index: number, value: string) {
    setChildNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Replace the single childName with the array
    formData.delete("childName");
    const names = childNames.filter((n) => n.trim() !== "");
    formData.set("childName", names.join(", "));
    formData.set("numKids", String(names.length));
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
        <div className="text-6xl mb-4 animate-rocket-launch inline-block">
          🚀
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">
          {attending === "yes"
            ? "Blast off! You're on the crew!"
            : "We'll miss you!"}
        </h3>
        <p className="text-indigo-100">
          {attending === "yes"
            ? "Your RSVP has been received! Check your email for a calendar invite. See you at the party!"
            : "Thanks for letting us know. Maybe next mission!"}
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
        <h3 className="text-2xl font-bold text-white mb-1">Mission RSVP</h3>
        <p className="text-indigo-200/80 text-sm">
          Confirm your spot on the crew
        </p>
      </div>

      {/* Children's names */}
      <div>
        <label className="block text-sm font-medium text-indigo-100 mb-1.5">
          Astronaut name{childNames.length > 1 ? "s" : ""} (child{childNames.length > 1 ? "ren" : ""})
        </label>
        <div className="space-y-2">
          {childNames.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updateChild(i, e.target.value)}
                required
                className="space-input flex-1"
                placeholder={`Astronaut ${i + 1}`}
              />
              {childNames.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChild(i)}
                  className="px-3 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-lg"
                  aria-label="Remove"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addChild}
          className="mt-2 text-sm text-indigo-400/70 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span> Add another astronaut
        </button>
      </div>

      {/* Parent's name */}
      <div>
        <label className="block text-sm font-medium text-indigo-100 mb-1.5">
          Mission Commander (parent/guardian)
        </label>
        <input
          type="text"
          name="parentName"
          required
          className="space-input"
          placeholder="Your name"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-indigo-100 mb-1.5">
          Your email
        </label>
        <input
          type="email"
          name="email"
          required
          className="space-input"
          placeholder="you@example.com"
        />
        <p className="text-xs text-indigo-200/40 mt-1">
          We&apos;ll send you a calendar invite
        </p>
      </div>

      {/* Attending? */}
      <div>
        <label className="block text-sm font-medium text-indigo-100 mb-2">
          Will you join the launch?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAttending("yes")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              attending === "yes"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "bg-indigo-950/50 text-indigo-200/80 border border-indigo-500/20 hover:border-indigo-500/40"
            }`}
          >
            Count us in!
          </button>
          <button
            type="button"
            onClick={() => setAttending("no")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              attending === "no"
                ? "bg-rose-600/80 text-white shadow-lg shadow-rose-500/20"
                : "bg-indigo-950/50 text-indigo-200/80 border border-indigo-500/20 hover:border-indigo-500/40"
            }`}
          >
            Can&apos;t make it
          </button>
        </div>
        <input type="hidden" name="attending" value={attending} />
      </div>

      {attending === "yes" && (
        <div>
          <label className="block text-sm font-medium text-indigo-100 mb-1.5">
            Any allergies or dietary needs?
          </label>
          <input
            type="text"
            name="dietary"
            className="space-input"
            placeholder="e.g. nut allergy, vegetarian..."
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-indigo-100 mb-1.5">
          Message for Kiran (optional)
        </label>
        <textarea
          name="message"
          rows={3}
          className="space-input resize-none"
          placeholder="Happy birthday, Kiran! 🚀"
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
          bg-gradient-to-r from-indigo-600 to-purple-600
          hover:from-indigo-500 hover:to-purple-500
          disabled:opacity-40 disabled:cursor-not-allowed
          shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
          active:scale-[0.98]"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Transmitting...
          </span>
        ) : (
          "Launch RSVP 🚀"
        )}
      </button>
    </form>
  );
}
