import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2, Copy, ExternalLink, Trash2, Check, X, ChevronDown, ChevronUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GenerateLinkDialog } from "@/components/GenerateLinkDialog";
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
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface InvitationLink {
  id: string;
  link_name: string;
  unique_slug: string;
  number_of_persons: number;
  created_at: string;
}

interface Invitee {
  id: string;
  name: string;
  is_attending: boolean | null;
  invitation_link_id: string;
  created_at: string;
}

interface Wedding {
  id: string;
  bride_name: string;
  groom_name: string;
  slug: string;
  status: string;
}

const ManageLinks = () => {
  const { weddingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [links, setLinks] = useState<InvitationLink[]>([]);
  const [invitees, setInvitees] = useState<Record<string, Invitee[]>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [generateLinkOpen, setGenerateLinkOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (weddingId) {
      fetchData();
    }
  }, [weddingId, refresh]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch wedding details
      const { data: weddingData, error: weddingError } = await supabase
        .from("weddings")
        .select("*")
        .eq("id", weddingId)
        .single();

      if (weddingError) throw weddingError;
      setWedding(weddingData);

      // Fetch invitation links
      const { data: linksData, error: linksError } = await supabase
        .from("invitation_links")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: false });

      if (linksError) throw linksError;
      setLinks(linksData || []);

      // Fetch all invitees for these links
      if (linksData && linksData.length > 0) {
        const linkIds = linksData.map(link => link.id);
        const { data: inviteesData, error: inviteesError } = await supabase
          .from("invitees")
          .select("*")
          .in("invitation_link_id", linkIds)
          .order("name");

        if (inviteesError) throw inviteesError;

        // Group invitees by invitation_link_id
        const groupedInvitees: Record<string, Invitee[]> = {};
        (inviteesData || []).forEach((invitee) => {
          if (!groupedInvitees[invitee.invitation_link_id]) {
            groupedInvitees[invitee.invitation_link_id] = [];
          }
          groupedInvitees[invitee.invitation_link_id].push(invitee);
        });
        setInvitees(groupedInvitees);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load invitation links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (linkSlug: string, numberOfPersons: number) => {
    const fullUrl = `${window.location.origin}/invite/${wedding?.slug}/${linkSlug}/${numberOfPersons}`;
    await navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Copied!",
      description: "Invitation link copied to clipboard",
    });
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("invitation_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
      
      setRefresh(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting link:", error);
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const getRSVPStats = (linkId: string) => {
    const linkInvitees = invitees[linkId] || [];
    const attending = linkInvitees.filter(i => i.is_attending === true).length;
    const notAttending = linkInvitees.filter(i => i.is_attending === false).length;
    const pending = linkInvitees.filter(i => i.is_attending === null).length;
    
    return { attending, notAttending, pending, total: linkInvitees.length };
  };

  const toggleCard = (linkId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [linkId]: !prev[linkId]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    links.forEach(link => {
      allExpanded[link.id] = true;
    });
    setExpandedCards(allExpanded);
  };

  const collapseAll = () => {
    setExpandedCards({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Wedding not found</p>
            <Button onClick={() => navigate("/dashboard/my-events")} className="mt-4">
              Back to My Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                Manage Invitation Links
              </h1>
              <p className="text-muted-foreground mt-1">
                {wedding.bride_name} & {wedding.groom_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setGenerateLinkOpen(true)}>
                Generate New Link
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard/my-events")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {links.length === 0 ? (
          <Card className="shadow-elegant">
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No invitation links created yet</p>
              <Button onClick={() => setGenerateLinkOpen(true)}>
                Generate Your First Link
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>

            {links.map((link) => {
              const stats = getRSVPStats(link.id);
              const linkInvitees = invitees[link.id] || [];
              const isExpanded = expandedCards[link.id] || false;
              
              return (
                <Collapsible
                  key={link.id}
                  open={isExpanded}
                  onOpenChange={() => toggleCard(link.id)}
                >
                  <Card className="shadow-soft hover:shadow-elegant transition-all duration-300 border-l-4 border-l-primary/30">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left side - Main info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-serif font-semibold text-foreground">
                                {link.link_name}
                              </h3>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {stats.total} {stats.total === 1 ? 'guest' : 'guests'}
                              </span>
                              <span>•</span>
                              <span>
                                Created {new Date(link.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>

                            {/* RSVP Summary Badges */}
                            <div className="flex flex-wrap gap-2">
                              <Badge 
                                variant="outline" 
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              >
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                {stats.attending} Attending
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              >
                                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                {stats.notAttending} Not Attending
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                              >
                                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                {stats.pending} Pending
                              </Badge>
                            </div>
                          </div>

                          {/* Right side - Action buttons */}
                          <div 
                            className="flex gap-2 self-start"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(link.unique_slug, link.number_of_persons);
                              }}
                              title="Copy Link"
                              className="hover:bg-primary/10"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/invite/${wedding.slug}/${link.unique_slug}/${link.number_of_persons}`, '_blank');
                              }}
                              title="Open Link"
                              className="hover:bg-primary/10"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(link.id);
                              }}
                              title="Delete Link"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {linkInvitees.length > 0 ? (
                          <div className="border rounded-lg overflow-hidden bg-white shadow-inner">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-accent/30">
                                    <TableHead className="font-semibold">Guest Name</TableHead>
                                    <TableHead className="font-semibold">RSVP Status</TableHead>
                                    <TableHead className="text-right font-semibold">Response Date</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {linkInvitees.map((invitee, index) => (
                                    <TableRow 
                                      key={invitee.id}
                                      className={index % 2 === 0 ? 'bg-white' : 'bg-accent/5'}
                                    >
                                      <TableCell className="font-medium">{invitee.name}</TableCell>
                                      <TableCell>
                                        {invitee.is_attending === null ? (
                                          <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                                            Pending
                                          </Badge>
                                        ) : invitee.is_attending ? (
                                          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                            <Check className="w-3 h-3 mr-1" />
                                            Attending
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                                            <X className="w-3 h-3 mr-1" />
                                            Not Attending
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right text-sm text-muted-foreground">
                                        {invitee.is_attending !== null 
                                          ? new Date(invitee.created_at).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric'
                                            })
                                          : '-'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground bg-accent/5 rounded-lg">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>No invitees added to this link yet</p>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this link?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invitation link
              and all associated invitee responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteLink(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {wedding && (
        <GenerateLinkDialog
          open={generateLinkOpen}
          onOpenChange={setGenerateLinkOpen}
          weddingId={wedding.id}
          weddingSlug={wedding.slug}
          onSuccess={() => setRefresh(prev => prev + 1)}
        />
      )}
    </div>
  );
};

export default ManageLinks;
