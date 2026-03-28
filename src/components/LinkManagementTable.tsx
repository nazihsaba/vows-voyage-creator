import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Copy, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InviteeListDialog } from "./InviteeListDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InvitationLink {
  id: string;
  link_name: string;
  unique_slug: string;
  number_of_persons: number;
  side: string | null;
  created_at: string;
}

interface LinkManagementTableProps {
  weddingId: string;
  weddingSlug: string;
  refresh: number;
}

export const LinkManagementTable = ({ weddingId, weddingSlug, refresh }: LinkManagementTableProps) => {
  const { toast } = useToast();
  const [links, setLinks] = useState<InvitationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [inviteeRefreshTrigger, setInviteeRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchLinks();
  }, [weddingId, refresh]);

  // Set up real-time subscription for invitation links
  useEffect(() => {
    const channel = supabase
      .channel("invitation-links-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invitation_links",
          filter: `wedding_id=eq.${weddingId}`,
        },
        () => {
          fetchLinks();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [weddingId]);

  const handleOpenInvitees = (linkId: string) => {
    setSelectedLinkId(linkId);
    // Trigger a refresh when opening the dialog
    setInviteeRefreshTrigger((prev) => prev + 1);
  };

  const fetchLinks = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("invitation_links")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching links:", error);
      toast({
        title: "Error",
        description: "Failed to load invitation links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (link: InvitationLink) => {
    const sanitizedLinkName = link.link_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    // Use weddingSlug (the wedding's slug) as the first parameter, not the link's unique_slug
    const url = `${window.location.origin}/invite/${weddingSlug}/${sanitizedLinkName}/${link.number_of_persons}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Link copied",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await (supabase as any).from("invitation_links").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation link deleted successfully",
      });
      fetchLinks();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast({
        title: "Error",
        description: "Failed to delete invitation link",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading links...</p>;
  }

  if (links.length === 0) {
    return <p className="text-muted-foreground text-sm text-center py-4">No invitation links created yet</p>;
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Link Name</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Invitees</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-medium">{link.link_name}</TableCell>
                <TableCell>
                  {link.side ? (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        link.side === "GROOM"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
                      }`}
                    >
                      {link.side === "GROOM" ? "Groom" : "Bride"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {link.number_of_persons}
                  </div>
                </TableCell>
                <TableCell>{new Date(link.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenInvitees(link.id)}
                      title="View invitees"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleCopyLink(link)} title="Copy link">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(link.id)}
                      title="Delete link"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InviteeListDialog
        linkId={selectedLinkId}
        open={!!selectedLinkId}
        onOpenChange={(open) => !open && setSelectedLinkId(null)}
        refreshTrigger={inviteeRefreshTrigger}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invitation link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the link and all associated invitees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
