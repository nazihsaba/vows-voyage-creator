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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("share-event", {
        body: { weddingId, email: email.trim(), password: password.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Success", description: data.message || "Event shared successfully" });
      setEmail("");
      setPassword("");
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-8">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Event
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <span>Link this event to another user. If the account doesn't exist, it will be created.</span>
            <span className="block text-xs text-amber-600 font-medium mt-1">
              Note: Each event can only be shared with one account.
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="share-password">Password</Label>
            <Input
              id="share-password"
              type="password"
              placeholder="Password (used only if creating new account)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              If the user already exists, the password will be ignored.
            </p>
          </div>
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
