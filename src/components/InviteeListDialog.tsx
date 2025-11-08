import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Circle } from "lucide-react";

interface Invitee {
  id: string;
  name: string;
  is_attending: boolean | null;
}

interface InviteeListDialogProps {
  linkId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteeListDialog = ({ linkId, open, onOpenChange }: InviteeListDialogProps) => {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [linkName, setLinkName] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (linkId && open) {
      fetchInvitees();
    }
  }, [linkId, open]);

  const fetchInvitees = async () => {
    if (!linkId) return;

    try {
      setLoading(true);

      // Fetch link details
      const { data: linkData, error: linkError } = await supabase
        .from("invitation_links")
        .select("link_name")
        .eq("id", linkId)
        .single();

      if (linkError) throw linkError;
      setLinkName(linkData.link_name);

      // Fetch invitees
      const { data, error } = await supabase
        .from("invitees")
        .select("*")
        .eq("invitation_link_id", linkId)
        .order("name");

      if (error) throw error;
      setInvitees(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load invitees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (isAttending: boolean | null) => {
    if (isAttending === true) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    } else if (isAttending === false) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Circle className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusText = (isAttending: boolean | null) => {
    if (isAttending === true) return "Attending";
    if (isAttending === false) return "Not Attending";
    return "No Response";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invitees for "{linkName}"</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Loading invitees...</div>
        ) : invitees.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No invitees found for this link.
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {invitees.map((invitee) => (
              <div
                key={invitee.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(invitee.is_attending)}
                  <div>
                    <p className="font-medium">{invitee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {getStatusText(invitee.is_attending)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-500">
                {invitees.filter(i => i.is_attending === true).length}
              </p>
              <p className="text-sm text-muted-foreground">Attending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">
                {invitees.filter(i => i.is_attending === false).length}
              </p>
              <p className="text-sm text-muted-foreground">Not Attending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">
                {invitees.filter(i => i.is_attending === null).length}
              </p>
              <p className="text-sm text-muted-foreground">No Response</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
