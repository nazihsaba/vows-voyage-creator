import { useEffect, useMemo, useRef, useState, KeyboardEvent } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type Assignment = { guest_name: string; table_name: string };

export default function SeatingLookup() {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const [status, setStatus] = useState<"loading" | "found" | "notfound">("loading");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [selected, setSelected] = useState<Assignment[] | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!weddingSlug) {
        setStatus("notfound");
        return;
      }
      const { data: wedding } = await supabase
        .from("weddings")
        .select("id")
        .eq("slug", weddingSlug)
        .maybeSingle();
      if (cancelled) return;
      if (!wedding) {
        setStatus("notfound");
        return;
      }

      // Fetch tables (for table names) and invitees (via invitation_links scoped to this wedding)
      const [{ data: tables }, { data: links }] = await Promise.all([
        supabase
          .from("wedding_tables")
          .select("table_number, name")
          .eq("wedding_id", wedding.id),
        supabase
          .from("invitation_links")
          .select("id, invitees(name, table_number)")
          .eq("wedding_id", wedding.id),
      ]);
      if (cancelled) return;

      const tableNameByNumber = new Map<number, string>();
      (tables ?? []).forEach((t: any) => {
        if (t.table_number != null) tableNameByNumber.set(Number(t.table_number), t.name || "");
      });

      const list: Assignment[] = [];
      (links ?? []).forEach((l: any) => {
        (l.invitees ?? []).forEach((inv: any) => {
          if (inv?.name && inv?.table_number != null) {
            const num = Number(inv.table_number);
            const named = tableNameByNumber.get(num);
            const table_name = named && named.trim().length > 0 ? named : String(num);
            list.push({ guest_name: String(inv.name).trim(), table_name });
          }
        });
      });

      setAssignments(list);
      setStatus("found");
    })();
    return () => {
      cancelled = true;
    };
  }, [weddingSlug]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return assignments.filter((a) => a.guest_name.toLowerCase().includes(q));
  }, [query, assignments]);

  const visibleMatches = matches.slice(0, 8);
  const hasOverflow = matches.length > 8;

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (a: Assignment) => {
    const all = assignments.filter(
      (x) => x.guest_name.toLowerCase() === a.guest_name.toLowerCase(),
    );
    setSelected(all.length > 0 ? all : [a]);
    setQuery(a.guest_name);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || visibleMatches.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, visibleMatches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pickItem = visibleMatches[highlight];
      if (pickItem) pick(pickItem);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#faf6ef]">
        <Loader2 className="w-6 h-6 animate-spin text-[#865814]" />
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#faf6ef] px-6">
        <div className="text-center">
          <h1
            className="text-3xl text-[#3a2e1f] mb-2"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            Wedding not found
          </h1>
          <p className="text-sm text-[#6b5a45]">Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  const showDropdown = open && query.trim().length > 0;
  const serif = { fontFamily: '"Cormorant Garamond", Georgia, serif' } as const;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#faf6ef] px-6 py-12">
      <div className="w-full max-w-md text-center">
        <h1
          className="text-4xl sm:text-5xl text-[#3a2e1f] mb-3 tracking-wide"
          style={serif}
        >
          Find Your Table
        </h1>
        <p className="text-sm sm:text-base text-[#6b5a45] mb-10">
          Type your name to find your seating
        </p>

        <div className="relative" ref={wrapRef}>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (!e.target.value.trim()) setSelected(null);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search your name..."
            autoComplete="off"
            className="w-full px-5 py-4 text-base rounded-full bg-white border border-[#d4b878]/50 text-[#3a2e1f] placeholder:text-[#a89878] outline-none transition-all focus:border-[#865814] focus:ring-4 focus:ring-[#d4b878]/30"
          />

          {showDropdown && (
            <div
              className="absolute z-20 left-0 right-0 mt-2 rounded-2xl bg-[#fdfaf3] border border-[#d4b878]/60 shadow-[0_12px_32px_-12px_rgba(134,88,20,0.25)] overflow-hidden text-left"
            >
              {visibleMatches.length === 0 ? (
                <div className="px-5 py-4 text-sm text-[#6b5a45]" style={serif}>
                  No guest found with that name. Check the spelling or ask the host.
                </div>
              ) : (
                <ul role="listbox">
                  {visibleMatches.map((m, i) => (
                    <li
                      key={`${m.guest_name}-${m.table_name}-${i}`}
                      role="option"
                      aria-selected={i === highlight}
                      onMouseEnter={() => setHighlight(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(m);
                      }}
                      className={`min-h-[44px] flex items-center px-5 py-2.5 cursor-pointer text-lg text-[#3a2e1f] transition-colors ${
                        i === highlight ? "bg-[#d4b878]/25" : "bg-transparent"
                      }`}
                      style={serif}
                    >
                      {m.guest_name}
                    </li>
                  ))}
                  {hasOverflow && (
                    <li className="px-5 py-2 text-xs text-[#a89878] border-t border-[#d4b878]/30">
                      Keep typing to narrow down…
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        {selected && selected.length > 0 && query.trim().length > 0 && (
          <div className="mt-10 space-y-4">
            {selected.map((s, i) => (
              <div
                key={`${s.guest_name}-${s.table_name}-${i}`}
                className="rounded-2xl bg-[#fdfaf3] border border-[#d4b878]/60 shadow-[0_12px_32px_-12px_rgba(134,88,20,0.2)] px-6 py-8"
              >
                <p className="text-sm text-[#6b5a45] mb-2" style={serif}>
                  {s.guest_name}
                </p>
                <p
                  className="text-2xl sm:text-3xl text-[#3a2e1f] leading-snug"
                  style={serif}
                >
                  You are seated at{" "}
                  <span className="text-[#865814] font-semibold">
                    Table {s.table_name}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
