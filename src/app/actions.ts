"use server";

import { put, list } from "@vercel/blob";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const HOST_EMAIL = process.env.HOST_EMAIL || "darcydwyer@gmail.com";

interface RSVPData {
  childName: string;
  parentName: string;
  email: string;
  attending: string;
  numKids: string;
  dietary: string;
  message: string;
  timestamp: string;
}

function generateICS(): string {
  // May 10, 2026 — 3:00 PM to 5:30 PM CEST (UTC+2)
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KiranBirthday//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "DTSTART:20260510T130000Z",
    "DTEND:20260510T153000Z",
    "SUMMARY:Kiran's Birthday Party",
    "DESCRIPTION:Kiran's birthday party! See you there.",
    "LOCATION:Karel van Manderstraat 38\\, 2014 VE Haarlem\\, The Netherlands",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "UID:kiran-bday-2026@blastoff",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

async function sendHostNotification(data: RSVPData): Promise<{ error?: unknown }> {
  const attending = data.attending === "yes";
  const subject = attending
    ? `RSVP: ${data.childName} is coming!`
    : `RSVP: ${data.childName} can't make it`;

  const body = [
    attending ? "New crew member signed up!" : "Someone can't make it.",
    "",
    `Astronaut(s): ${data.childName}`,
    `Parent: ${data.parentName}`,
    `Email: ${data.email}`,
    `Attending: ${attending ? "Yes" : "No"}`,
    attending ? `Number of kids: ${data.numKids}` : "",
    data.dietary ? `Dietary needs: ${data.dietary}` : "",
    data.message ? `Message: ${data.message}` : "",
    "",
    `Submitted: ${new Date(data.timestamp).toLocaleString("en-NL", { timeZone: "Europe/Amsterdam" })}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await resend.emails.send({
    from: "Kiran Birthday <keerthi@productmind.pm>",
    to: HOST_EMAIL,
    subject,
    text: body,
  });
  return result;
}

async function sendGuestCalendarInvite(data: RSVPData): Promise<{ error?: unknown } | undefined> {
  if (data.attending !== "yes" || !data.email) return;

  const icsContent = generateICS();

  const result = await resend.emails.send({
    from: "Kiran Birthday <keerthi@productmind.pm>",
    to: data.email,
    subject: "You're going to Kiran's Birthday Party!",
    text: [
      `Hi ${data.parentName}!`,
      "",
      "Thanks for RSVPing to Kiran's Birthday Party!",
      "",
      "Saturday, May 10, 2026",
      "3:00 - 5:30 PM",
      "Karel van Manderstraat 38, 2014 VE Haarlem",
      "+31 6871013646",
      "",
      "A calendar invite is attached - add it to your calendar so you don't forget!",
      "",
      "See you at the party!",
    ].join("\n"),
    attachments: [
      {
        filename: "kirans-birthday.ics",
        content: Buffer.from(icsContent),
      },
    ],
  });
  return result;
}

export async function submitRSVP(formData: FormData) {
  const data: RSVPData = {
    childName: formData.get("childName") as string,
    parentName: formData.get("parentName") as string,
    email: formData.get("email") as string || "",
    attending: formData.get("attending") as string,
    numKids: formData.get("numKids") as string || "0",
    dietary: formData.get("dietary") as string || "",
    message: formData.get("message") as string || "",
    timestamp: new Date().toISOString(),
  };

  const emailErrors: string[] = [];

  // Store in Blob (non-blocking — don't fail RSVP if storage is unavailable)
  try {
    const filename = `rsvps/${Date.now()}-${data.childName.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    await put(filename, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
    });
  } catch {
    // Storage is optional — RSVP still works via email
  }

  // Send host notification
  try {
    const result = await sendHostNotification(data);
    if (result?.error) emailErrors.push(`Host: ${JSON.stringify(result.error)}`);
  } catch (error) {
    emailErrors.push(`Host: ${String(error)}`);
  }

  // Send guest calendar invite
  try {
    const result = await sendGuestCalendarInvite(data);
    if (result?.error) emailErrors.push(`Guest: ${JSON.stringify(result.error)}`);
  } catch (error) {
    emailErrors.push(`Guest: ${String(error)}`);
  }

  if (emailErrors.length > 0) {
    return { success: false, error: emailErrors.join(" | ") };
  }
  return { success: true };
}

export async function getRSVPs(): Promise<RSVPData[]> {
  try {
    const { blobs } = await list({ prefix: "rsvps/" });
    const rsvps: RSVPData[] = [];
    for (const blob of blobs) {
      const res = await fetch(blob.url);
      const data = await res.json();
      rsvps.push(data);
    }
    return rsvps.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}
