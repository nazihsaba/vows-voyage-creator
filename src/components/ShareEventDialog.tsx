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
import { AlertCircle, Loader2, Share2 } from "lucide-react";
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
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const body: Record<string, string> = { weddingId, email: email.trim() };
      if (password.trim()) {
        body.password = password.trim();
      }

      const { data, error } = await supabase.functions.invoke("share-event", { body });

      if (error) throw error;

      // If the server says a password is needed (new account)
      if (data?.needsPassword) {
        setNeedsPassword(true);
        toast({
          title: "Password required",
          description: "This email doesn't have an account yet. Please set a password for them.",
        });
        return;
      }

      if (data?.error) throw new Error(data.error);

      toast({ title: "Success", description: data.message || "Event shared successfully" });
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
    setPassword("");
    setNeedsPassword(false);
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-muted-foreground">
              The shared user will have full admin access: edit card details, create invitation links, and manage invitation links.
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            This event can only be shared with one account.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="share-email">Email</Label>
            <Input
              id="share-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setNeedsPassword(false);
              }}
              required
            />
          </div>
          {needsPassword && (
            <div className="space-y-2">
              <Label htmlFor="share-password">Password</Label>
              <Input
                id="share-password"
                type="password"
                placeholder="Set a password for the new account"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                This email doesn't have an account. A new account will be created with this password.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full rounded-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {needsPassword ? "Creating & Sharing..." : "Sharing..."}
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  {needsPassword ? "Create Account & Share" : "Share Event"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
