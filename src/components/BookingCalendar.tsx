import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
  Phone,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CalendlyEmbed from "@/components/CalendlyEmbed";

/** Times are shown in the business time zone (the meeting is in Beirut time). */
const TIME_ZONE = "Asia/Beirut";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type MeetingType = "google_meet" | "phone";
type Step = "date" | "details" | "done";

interface BookingCalendarProps {
  prefillEmail?: string;
  /** Backup booking link, shown under the calendar. */
  calendlyUrl?: string;
}

interface Confirmed {
  start: string;
  end: string;
  meeting_type: MeetingType;
  meet_link: string | null;
  emailSent: boolean;
}

// ---------- Date helpers (all in Beirut time) ----------
const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const dayKey = (d: Date) => keyFmt.format(d); // "2026-11-09"
const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, weekday: "long", day: "numeric", month: "long" }).format(
    new Date(iso),
  );
const keyToLabel = (key: string, opts: Intl.DateTimeFormatOptions) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
};
const monthKey = (key: string) => key.slice(0, 7); // "2026-11"
const shiftMonth = (mk: string, by: number) => {
  const [y, m] = mk.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

/** Grid of day keys for a month, Monday first; null = empty cell. */
function monthGrid(mk: string) {
  const [y, m] = mk.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${mk}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

const gcalDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const BookingCalendar = ({ prefillEmail, calendlyUrl }: BookingCalendarProps) => {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [month, setMonth] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("date");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [phone, setPhone] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("google_meet");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  useEffect(() => {
    if (prefillEmail && !email) setEmail(prefillEmail);
  }, [prefillEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    const { data, error } = await supabase.functions.invoke("physical-booking", { body: { action: "availability" } });
    if (error || !Array.isArray(data?.slots)) {
      setLoadError(true);
      setSlots([]);
    } else {
      setSlots(data.slots);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Slots grouped by day.
  const byDay = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of slots) {
      const k = dayKey(new Date(s));
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return map;
  }, [slots]);

  const firstDay = slots.length ? dayKey(new Date(slots[0])) : null;
  const lastDay = slots.length ? dayKey(new Date(slots[slots.length - 1])) : null;

  // Open on the first month that has free times; keep the chosen day if still free.
  useEffect(() => {
    if (!firstDay) return;
    setMonth((m) => m ?? monthKey(firstDay));
    setDay((d) => (d && byDay.has(d) ? d : null));
  }, [firstDay, byDay]);

  const shownMonth = month ?? monthKey(dayKey(new Date()));
  const canPrev = !!firstDay && shownMonth > monthKey(firstDay);
  const canNext = !!lastDay && shownMonth < monthKey(lastDay);
  const todayKey = dayKey(new Date());

  const chooseSlot = (s: string) => {
    setSlot(s);
    setFormError(null);
    setStep("details");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;
    setFormError(null);
    if (!name.trim()) return setFormError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setFormError("Please enter a valid email.");
    if (meetingType === "phone" && phone.replace(/\D/g, "").length < 7)
      return setFormError("Please enter a phone number we can call.");

    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("physical-booking", {
      body: { action: "book", start: slot, name, email, phone, meeting_type: meetingType, notes },
    });
    setSubmitting(false);

    if (data?.ok) {
      setConfirmed({ ...data.booking, emailSent: !!data.emailSent });
      setStep("done");
      return;
    }

    // Read the server's message, if there is one.
    let message = data?.error as string | undefined;
    let code = data?.code as string | undefined;
    const ctx = (error as { context?: Response } | null)?.context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        message = body?.error ?? message;
        code = body?.code ?? code;
      } catch {
        /* ignore */
      }
    }

    if (code === "slot_taken" || code === "invalid_slot") {
      setSlot(null);
      setStep("date");
      setNotice(message ?? "Sorry, this time was just taken. Please pick another.");
      loadSlots();
      return;
    }
    setFormError(message ?? "Something went wrong. Please try again.");
  };

  const startOver = () => {
    setConfirmed(null);
    setSlot(null);
    setDay(null);
    setNotes("");
    setStep("date");
    loadSlots();
  };

  // ---------- Render ----------
  const backupLink = calendlyUrl ? (
    <a
      href={calendlyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 flex items-center justify-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Having trouble? Book through Calendly instead
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  ) : null;

  if (loading && !slots.length) {
    return (
      <div className="py-24 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        Finding available times…
      </div>
    );
  }

  // If our calendar can't load (e.g. Google Calendar not connected yet), fall back to Calendly.
  if (loadError && calendlyUrl) {
    return <CalendlyEmbed url={calendlyUrl} prefill={{ email: prefillEmail }} />;
  }

  if (loadError || !slots.length) {
    return (
      <div className="px-4 py-16 text-center">
        <CalendarDays className="w-8 h-8 mx-auto text-primary mb-3" />
        <p className="font-serif text-lg font-semibold text-foreground">
          {loadError ? "We couldn't load the calendar" : "No times available right now"}
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          {loadError
            ? "Please try again in a moment, or use the link below."
            : "All our evenings are booked for now. Please check back soon, or use the link below."}
        </p>
        <Button variant="outline" className="mt-5 rounded-full" onClick={loadSlots}>
          Try again
        </Button>
        {backupLink}
      </div>
    );
  }

  if (step === "done" && confirmed) {
    const addToCalendar =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent("Auréa Invites — Physical cards consultation")}` +
      `&dates=${gcalDate(confirmed.start)}/${gcalDate(confirmed.end)}` +
      `&details=${encodeURIComponent(confirmed.meet_link ? `Google Meet: ${confirmed.meet_link}` : "We'll call you at this time.")}`;
    return (
      <div className="px-4 sm:px-8 py-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-bronze/10 border border-bronze/40 flex items-center justify-center mb-5">
          <CalendarCheck className="w-7 h-7 text-bronze" />
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">You're booked!</h3>
        <p className="font-script text-xl sm:text-2xl mt-1 text-bronze">
          We can't wait to meet you
        </p>

        <div className="mt-6 mx-auto max-w-sm rounded-2xl bg-muted/40 border border-bronze/25 p-5 text-left space-y-3">
          <div className="flex items-start gap-3">
            <CalendarDays className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <p className="text-sm text-foreground font-medium">{longDate(confirmed.start)}</p>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              {timeLabel(confirmed.start)} – {timeLabel(confirmed.end)}{" "}
              <span className="text-muted-foreground">(Beirut time)</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            {confirmed.meeting_type === "google_meet" ? (
              <Video className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            ) : (
              <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            )}
            <p className="text-sm text-foreground break-all">
              {confirmed.meeting_type === "google_meet" ? (
                confirmed.meet_link ? (
                  <a href={confirmed.meet_link} target="_blank" rel="noopener noreferrer" className="underline">
                    {confirmed.meet_link.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  "Google Meet link coming by email"
                )
              ) : (
                `We'll call you on ${phone}`
              )}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          {confirmed.emailSent ? `A confirmation was sent to ${email}.` : "Please save these details."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="rounded-full px-6">
            <a href={addToCalendar} target="_blank" rel="noopener noreferrer">
              Add to my calendar
            </a>
          </Button>
          <Button variant="ghost" className="rounded-full" onClick={startOver}>
            Book another time
          </Button>
        </div>
      </div>
    );
  }

  if (step === "details" && slot) {
    return (
      <div className="px-3 sm:px-8 py-6 sm:py-8">
        <button
          type="button"
          onClick={() => setStep("date")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change time
        </button>

        <div className="mt-4 rounded-2xl bg-muted/40 border border-bronze/25 px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarDays className="w-4 h-4 text-primary" />
            {longDate(slot)}
          </span>
          <span className="flex items-center gap-2 text-sm text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            {timeLabel(slot)} · 30 min
          </span>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bk-name">Your name</Label>
              <Input id="bk-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bk-email">Email</Label>
              <Input
                id="bk-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>How would you like to meet?</Label>
            <div role="radiogroup" className="grid sm:grid-cols-2 gap-3">
              {(
                [
                  { id: "google_meet", icon: Video, title: "Google Meet", text: "Video call, link sent by email" },
                  { id: "phone", icon: Phone, title: "Phone or WhatsApp", text: "We call you at this time" },
                ] as const
              ).map(({ id, icon: Icon, title, text }) => {
                const active = meetingType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMeetingType(id)}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/40 ${
                      active ? "border-bronze bg-bronze/5 shadow-sm" : "border-border hover:border-bronze/50"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                        active ? "bg-bronze text-white" : "bg-muted text-foreground/70"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-foreground">{title}</span>
                      <span className="block text-xs text-muted-foreground">{text}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bk-phone">
              Phone / WhatsApp{" "}
              {meetingType === "google_meet" && <span className="text-muted-foreground font-normal">(optional)</span>}
            </Label>
            <Input
              id="bk-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={40}
              placeholder="+961 …"
              autoComplete="tel"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bk-notes">
              Anything we should know? <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="bk-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Wedding date, number of guests, style you like…"
            />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" disabled={submitting} className="w-full rounded-full py-6 text-base">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarCheck className="w-4 h-4 mr-2" />}
            Confirm booking
          </Button>
        </form>
        {backupLink}
      </div>
    );
  }

  // Step: choose a date and time
  const daySlots = day ? byDay.get(day) ?? [] : [];
  return (
    <div className="px-2 sm:px-6 py-4 sm:py-6">
      {notice && (
        <p className="mb-4 rounded-xl bg-bronze/5 border border-bronze/30 px-4 py-3 text-sm text-foreground text-center">
          {notice}
        </p>
      )}
      <div className="mx-auto max-w-[760px] grid gap-6 md:gap-10 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Month */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              type="button"
              onClick={() => setMonth(shiftMonth(shownMonth, -1))}
              disabled={!canPrev}
              aria-label="Previous month"
              className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-bronze/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="font-serif text-lg font-semibold text-foreground">
              {keyToLabel(`${shownMonth}-01`, { month: "long", year: "numeric" })}
            </p>
            <button
              type="button"
              onClick={() => setMonth(shiftMonth(shownMonth, 1))}
              disabled={!canNext}
              aria-label="Next month"
              className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-bronze/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-xs text-muted-foreground pb-2">
                {w}
              </div>
            ))}
            {monthGrid(shownMonth).map((k, i) => {
              if (!k) return <div key={`e${i}`} />;
              const available = byDay.has(k);
              const selected = day === k;
              return (
                <button
                  key={k}
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    setDay(k);
                    setNotice(null);
                  }}
                  aria-label={keyToLabel(k, { weekday: "long", day: "numeric", month: "long" })}
                  aria-pressed={selected}
                  className={`relative aspect-square rounded-full text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/40 ${
                    selected
                      ? "bg-bronze text-white font-semibold shadow-md"
                      : available
                        ? "bg-bronze/10 text-foreground font-medium hover:bg-bronze/20"
                        : "text-muted-foreground/45 cursor-default"
                  }`}
                >
                  {Number(k.slice(8))}
                  {k === todayKey && !selected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-bronze" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Times */}
        <div className="md:border-l md:border-bronze/15 md:pl-10">
          {day ? (
            <>
              <p className="font-serif text-base font-semibold text-foreground">
                {keyToLabel(day, { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <p className="text-xs text-muted-foreground mb-4">Beirut time · 30 minutes</p>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                {daySlots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => chooseSlot(s)}
                    className="rounded-full border border-bronze bg-button py-2.5 text-sm font-medium text-button-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/40"
                  >
                    {timeLabel(s)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
              <Clock className="w-6 h-6 text-primary" />
              <p className="text-sm">Choose a highlighted day to see the available times.</p>
            </div>
          )}
        </div>
      </div>
      {backupLink}
    </div>
  );
};

export default BookingCalendar;
