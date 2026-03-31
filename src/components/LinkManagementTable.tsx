import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Copy, Trash2, Users, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface Invitee {
  id: string;
  name: string;
  is_attending: boolean | null;
  table_number: number | null;
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedLinkId, setExpandedLinkId] = useState<string | null>(null);
  const [inviteesByLink, setInviteesByLink] = useState<Record<string, Invitee[]>>({});
  const [loadingInvitees, setLoadingInvitees] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [weddingId, refresh]);

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

  const fetchInvitees = async (linkId: string) => {
    setLoadingInvitees(linkId);
    try {
      const { data, error } = await (supabase as any)
        .from("invitees")
        .select("*")
        .eq("invitation_link_id", linkId)
        .order("name");

      if (error) throw error;
      setInviteesByLink((prev) => ({ ...prev, [linkId]: data || [] }));
    } catch (error) {
      console.error("Error fetching invitees:", error);
    } finally {
      setLoadingInvitees(null);
    }
  };

  const toggleExpand = (linkId: string) => {
    if (expandedLinkId === linkId) {
      setExpandedLinkId(null);
    } else {
      setExpandedLinkId(linkId);
      if (!inviteesByLink[linkId]) {
        fetchInvitees(linkId);
      }
    }
  };

  const handleCopyLink = (link: InvitationLink) => {
    const sanitizedLinkName = link.link_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
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
              <TableHead className="w-8"></TableHead>
              <TableHead>Link Name</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Table #</TableHead>
              <TableHead>Invitees</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => {
              const isExpanded = expandedLinkId === link.id;
              const invitees = inviteesByLink[link.id] || [];
              const isLoadingThis = loadingInvitees === link.id;

              // Get unique table numbers for the group summary
              const tableNumbers = [...new Set(invitees.filter(i => i.table_number != null).map(i => i.table_number))];

              return (
                <>
                  <TableRow
                    key={link.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleExpand(link.id)}
                  >
                    <TableCell className="w-8 px-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </TableCell>
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
                      {isExpanded && tableNumbers.length > 0
                        ? tableNumbers.join(", ")
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {link.number_of_persons}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
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
                  {isExpanded && (
                    isLoadingThis ? (
                      <TableRow key={`${link.id}-loading`}>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-3">
                          Loading invitees...
                        </TableCell>
                      </TableRow>
                    ) : invitees.length === 0 ? (
                      <TableRow key={`${link.id}-empty`}>
                        <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-3">
                          No invitees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      invitees.map((invitee) => (
                        <TableRow key={invitee.id} className="bg-muted/30">
                          <TableCell></TableCell>
                          <TableCell className="pl-8 text-sm">{invitee.name}</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-sm">
                            {invitee.table_number != null ? (
                              invitee.table_number
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

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
