import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { User, CheckCircle2, XCircle, HelpCircle } from "lucide-react";

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

export const InviteeListDialog = ({
  linkId,
  open,
  onOpenChange,
}: InviteeListDialogProps) => {
  const { toast } = useToast();
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (linkId && open) {
      fetchInvitees();
    }
  }, [linkId, open]);

  const fetchInvitees = async () => {
    if (!linkId) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("invitees")
        .select("*")
        .eq("invitation_link_id", linkId)
        .order("name");

      if (error) throw error;
      setInvitees(data || []);
    } catch (error) {
      console.error("Error fetching invitees:", error);
      toast({
        title: "Error",
        description: "Failed to load invitees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceIcon = (isAttending: boolean | null) => {
    if (isAttending === true) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    } else if (isAttending === false) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
  };

  const getAttendanceText = (isAttending: boolean | null) => {
    if (isAttending === true) return "Attending";
    if (isAttending === false) return "Not Attending";
    return "No Response";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invitee List</DialogTitle>
          <DialogDescription>
            View attendance status for all invitees
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {loading ? (
            <p className="text-muted-foreground text-center">Loading...</p>
          ) : invitees.length === 0 ? (
            <p className="text-muted-foreground text-center">No invitees found</p>
          ) : (
            invitees.map((invitee) => (
              <Card key={invitee.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{invitee.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAttendanceIcon(invitee.is_attending)}
                      <span className="text-sm text-muted-foreground">
                        {getAttendanceText(invitee.is_attending)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Invitees:</span>
            <span className="font-medium">{invitees.length}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Confirmed Attending:</span>
            <span className="font-medium text-green-600">
              {invitees.filter((i) => i.is_attending === true).length}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Not Attending:</span>
            <span className="font-medium text-red-600">
              {invitees.filter((i) => i.is_attending === false).length}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
