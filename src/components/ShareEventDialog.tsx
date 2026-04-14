import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  onSuccess: () => void;
}

export const ShareEventDialog = ({ open, onOpenChange, weddingId, onSuccess }: ShareEventDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("share-event", {
        body: { weddingId, email: email.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Success",
        description: `The event is now shared with ${email.trim()}`,
      });
      resetAndClose();
      onSuccess();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to share event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetAndClose();
        else onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md p-8">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Event
          </DialogTitle>
          <DialogDescription>
            Link this event to another user. If the account doesn't exist, it will be created.
          </DialogDescription>
          <div className="flex items-start gap-2 rounded-md bg-muted border border-border p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-xs text-muted-foreground flex flex-col gap-2">
              <span>
                The shared user will have full admin access: edit card details, create invitation links, and manage
                invitation links.
              </span>
              <p className="font-bold">This event can only be shared with one account.</p>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="share-email">Email</Label>
            <Input
              id="share-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {loading && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-muted" />
                <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-t-primary animate-spin" />
              </div>
              <p className="text-xs text-muted-foreground">Sharing event...</p>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full rounded-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Event
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
