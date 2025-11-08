import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InviteeListDialog } from "./InviteeListDialog";

interface InvitationLink {
  id: string;
  link_name: string;
  unique_slug: string;
  number_of_persons: number;
  created_at: string;
}

interface LinkManagementTableProps {
  weddingId: string;
  refreshTrigger: number;
}

export const LinkManagementTable = ({ weddingId, refreshTrigger }: LinkManagementTableProps) => {
  const [links, setLinks] = useState<InvitationLink[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, [weddingId, refreshTrigger]);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("invitation_links")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load invitation links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (slug: string, numPersons: number) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/${slug}/${numPersons}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Invitation link copied to clipboard",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading links...</div>;
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No invitation links generated yet. Click "Generate Link" to create one.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Link Name</TableHead>
            <TableHead>URL Slug</TableHead>
            <TableHead>Persons</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => (
            <TableRow key={link.id}>
              <TableCell className="font-medium">{link.link_name}</TableCell>
              <TableCell>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  /{link.unique_slug}/{link.number_of_persons}
                </code>
              </TableCell>
              <TableCell>{link.number_of_persons}</TableCell>
              <TableCell>
                {new Date(link.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyLink(link.unique_slug, link.number_of_persons)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLinkId(link.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <InviteeListDialog
        linkId={selectedLinkId}
        open={!!selectedLinkId}
        onOpenChange={(open) => !open && setSelectedLinkId(null)}
      />
    </>
  );
};
