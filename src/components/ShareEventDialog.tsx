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
          <DialogDescription className="space-y-1">
            <span>Link this event to another user. If the account doesn't exist, it will be created.</span>
            <span className="block text-xs text-muted-foreground mt-2">
              The shared user will have full admin access: edit card details, create invitation links, and manage
              invitation links.
            </span>
            <span className="block text-xs text-destructive font-medium mt-2">
              Note: This event can only be shared with one account.
            </span>
          </DialogDescription>
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
