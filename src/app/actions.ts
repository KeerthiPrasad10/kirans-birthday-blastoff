"use server";

import { put, list } from "@vercel/blob";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const HOST_EMAIL = process.env.HOST_EMAIL || "bengisu.corakci@gmail.com";

interface RSVPData {
  guestName: string;
  email: string;
  attending: string;
  numAdults: string;
  numChildren: string;
  childAges: string;
  dietary: string;
  message: string;
  timestamp: string;
}

function generateICS(): string {
  // July 18, 2026 — 15:00 to 18:00 CEST (UTC+2) = 13:00 to 16:00 UTC
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NicolaBirthday//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "DTSTART:20260718T130000Z",
    "DTEND:20260718T160000Z",
    "SUMMARY:Nicola's 40th Birthday - By The Sea",
    "DESCRIPTION:Nicola's 40th birthday celebration at Baia Beachclub. Sun\\, sea\\, drinks!",
    "LOCATION:Baia Beachclub\\, Strand Noord 59\\, 2586 ZZ Scheveningen\\, The Netherlands",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "UID:nicola-40-bday-2026@bythesea",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

async function sendHostNotification(data: RSVPData): Promise<{ error?: unknown }> {
  const attending = data.attending === "yes";
  const subject = attending
    ? `RSVP: ${data.guestName} is coming!`
    : `RSVP: ${data.guestName} can't make it`;

  const body = [
    attending ? "New guest confirmed!" : "Someone can't make it.",
    "",
    `Guest: ${data.guestName}`,
    `Email: ${data.email}`,
    `Attending: ${attending ? "Yes" : "No"}`,
    attending ? `Number of adults: ${data.numAdults}` : "",
    attending && Number(data.numChildren) > 0 ? `Number of children: ${data.numChildren}` : "",
    data.childAges ? `Children's ages: ${data.childAges}` : "",
    data.dietary ? `Dietary requirements: ${data.dietary}` : "",
    data.message ? `Message: ${data.message}` : "",
    "",
    `Submitted: ${new Date(data.timestamp).toLocaleString("en-NL", { timeZone: "Europe/Amsterdam" })}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await resend.emails.send({
    from: "Nicola's 40th <keerthi@productmind.pm>",
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
    from: "Nicola's 40th <keerthi@productmind.pm>",
    to: data.email,
    subject: "You're going to Nicola's 40th Birthday by the Sea!",
    text: [
      `Hi ${data.guestName}!`,
      "",
      "Thanks for RSVPing to Nicola's 40th Birthday!",
      "",
      "Saturday, July 18, 2026",
      "3:00 - 6:00 PM",
      "Baia Beachclub",
      "Strand Noord 59, 2586 ZZ Scheveningen",
      "",
      "A calendar invite is attached - add it to your calendar so you don't forget!",
      "",
      "See you at the party!",
    ].join("\n"),
    attachments: [
      {
        filename: "nicolas-40th.ics",
        content: Buffer.from(icsContent),
      },
    ],
  });
  return result;
}

export async function submitRSVP(formData: FormData) {
  const data: RSVPData = {
    guestName: formData.get("guestName") as string,
    email: formData.get("email") as string || "",
    attending: formData.get("attending") as string,
    numAdults: formData.get("numAdults") as string || "0",
    numChildren: formData.get("numChildren") as string || "0",
    childAges: formData.get("childAges") as string || "",
    dietary: formData.get("dietary") as string || "",
    message: formData.get("message") as string || "",
    timestamp: new Date().toISOString(),
  };

  const emailErrors: string[] = [];

  try {
    const filename = `rsvps/${Date.now()}-${data.guestName.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    await put(filename, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
    });
  } catch {
    // Storage is optional
  }

  try {
    const result = await sendHostNotification(data);
    if (result?.error) emailErrors.push(`Host: ${JSON.stringify(result.error)}`);
  } catch (error) {
    emailErrors.push(`Host: ${String(error)}`);
  }

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
