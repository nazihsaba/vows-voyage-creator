import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function SeatingLookup() {
  const { weddingSlug } = useParams<{ weddingSlug: string }>();
  const [status, setStatus] = useState<"loading" | "found" | "notfound">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!weddingSlug) {
        setStatus("notfound");
        return;
      }
      const { data, error } = await supabase
        .from("weddings")
        .select("id")
        .eq("slug", weddingSlug)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) setStatus("notfound");
      else setStatus("found");
    })();
    return () => {
      cancelled = true;
    };
  }, [weddingSlug]);

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

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#faf6ef] px-6 py-12">
      <div className="w-full max-w-md text-center">
        <h1
          className="text-4xl sm:text-5xl text-[#3a2e1f] mb-3 tracking-wide"
          style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        >
          Find Your Table
        </h1>
        <p className="text-sm sm:text-base text-[#6b5a45] mb-10">
          Type your name to find your seating
        </p>

        <div className="relative">
          <input
            type="text"
            placeholder="Search your name..."
            className="w-full px-5 py-4 text-base rounded-full bg-white border border-[#d4b878]/50 text-[#3a2e1f] placeholder:text-[#a89878] outline-none transition-all focus:border-[#865814] focus:ring-4 focus:ring-[#d4b878]/30"
          />
        </div>
      </div>
    </div>
  );
}
