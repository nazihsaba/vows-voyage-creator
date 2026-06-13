import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (next: string) => void;
}

export default function NotificationEmailsField({ value, onChange }: Props) {
  const [list, setList] = useState<string[]>(() => {
    const parsed = (value || "").split(",").map((s) => s.trim()).filter(Boolean);
    return parsed.length === 0 ? [""] : parsed;
  });

  // Sync if external value changes to something different (e.g. initial load)
  useEffect(() => {
    const parsed = (value || "").split(",").map((s) => s.trim()).filter(Boolean);
    const joined = list.map((s) => s.trim()).filter(Boolean).join(", ");
    if (parsed.join(", ") !== joined && parsed.join(", ") !== "") {
      setList(parsed.length === 0 ? [""] : parsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const update = (next: string[]) => {
    setList(next);
    onChange(next.map((s) => s.trim()).filter(Boolean).join(", "));
  };

  return (
    <div className="space-y-2">
      {list.map((email, idx) => (
        <div key={idx} className="flex gap-2">
          <Input
            type="email"
            placeholder={idx === 0 ? "you@example.com" : "additional@example.com"}
            value={email}
            onChange={(e) => {
              const next = [...list];
              next[idx] = e.target.value;
              update(next);
            }}
          />
          {list.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => update(list.filter((_, i) => i !== idx))}
              aria-label="Remove email"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {list.length < 2 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => update([...list, ""])}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add another email
        </Button>
      )}
    </div>
  );
}
