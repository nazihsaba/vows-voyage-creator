import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2, Copy, ExternalLink, Trash2, Check, X, Users, Search, ChevronDown, ChevronRight } from "lucide-react";
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
  const [expandedLinks, setExpandedLinks] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

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

  const copyToClipboard = async (linkName: string, numberOfPersons: number) => {
    const sanitizedLinkName = linkName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    // Use wedding.slug as the first parameter, not the link's unique_slug
    const fullUrl = `${window.location.origin}/invite/${wedding?.slug}/${sanitizedLinkName}/${numberOfPersons}`;
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

  const toggleLink = (linkId: string) => {
    setExpandedLinks(prev => ({
      ...prev,
      [linkId]: !prev[linkId]
    }));
  };

  const filteredLinks = links.filter(link => {
    const linkInvitees = invitees[link.id] || [];
    const matchesLinkName = link.link_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGuestName = linkInvitees.some(invitee => 
      invitee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesLinkName || matchesGuestName;
  });

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="bg-white/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-foreground">
                  Manage Links
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {wedding.bride_name} & {wedding.groom_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button onClick={() => setGenerateLinkOpen(true)} className="rounded-full px-4 sm:px-5 shadow-sm hover:shadow-md transition-all text-sm">
                Generate Link
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard/my-events")} className="rounded-full border-border/60 hover:bg-muted/50">
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
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
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-foreground">Invitation Links & Guests</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredLinks.length} {filteredLinks.length === 1 ? 'link' : 'links'} • {Object.values(invitees).flat().length} total guests
                  </p>
                  {(() => {
                    const allInvitees = Object.values(invitees).flat();
                    const attending = allInvitees.filter(i => i.is_attending === true).length;
                    const notAttending = allInvitees.filter(i => i.is_attending === false).length;
                    const pending = allInvitees.filter(i => i.is_attending === null).length;
                    return (
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0 text-xs font-medium">
                          <Check className="w-3 h-3 mr-1" /> {attending} attending
                        </Badge>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-0 text-xs font-medium">
                          <Loader2 className="w-3 h-3 mr-1" /> {pending} pending
                        </Badge>
                        <Badge variant="secondary" className="bg-red-100 text-red-700 border-0 text-xs font-medium">
                          <X className="w-3 h-3 mr-1" /> {notAttending} not attending
                        </Badge>
                      </div>
                    );
                  })()}
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search links or guests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border border-border/30">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 border-b border-border/40">
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Link Name</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Side</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Created</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Guests</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">RSVP</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLinks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {searchQuery ? "No invitation links or guests match your search" : "No invitation links created yet"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLinks.map((link, linkIndex) => {
                          const linkInvitees = invitees[link.id] || [];
                          const stats = getRSVPStats(link.id);
                          const isExpanded = expandedLinks[link.id] || false;
                          
                          return (
                            <React.Fragment key={link.id}>
                              {/* Main Link Row */}
                              <TableRow 
                                className={`${linkIndex % 2 === 0 ? 'bg-white' : 'bg-muted/20'} hover:bg-primary/5 transition-all duration-200 cursor-pointer border-b border-border/20`}
                                onClick={() => toggleLink(link.id)}
                              >
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-6 w-6"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell className="font-semibold text-foreground">
                                  {link.link_name}
                                </TableCell>
                                <TableCell>
                                  {link.side ? (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      link.side === 'GROOM' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                        : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                                    }`}>
                                      {link.side === 'GROOM' ? 'Groom' : 'Bride'}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(link.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium">
                                    {stats.total} {stats.total === 1 ? 'guest' : 'guests'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1.5">
                                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 text-xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                                      {stats.attending}
                                    </Badge>
                                    <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 text-xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>
                                      {stats.notAttending}
                                    </Badge>
                                    <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700 text-xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1"></span>
                                      {stats.pending}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div 
                                    className="flex gap-1 justify-end"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(link.link_name, link.number_of_persons)}
                                      title="Copy Link"
                                      className="h-8 w-8"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        const sanitizedLinkName = link.link_name
                                          .toLowerCase()
                                          .replace(/[^a-z0-9]+/g, '-')
                                          .replace(/^-+|-+$/g, '');
                                        window.open(`/invite/${wedding?.slug}/${sanitizedLinkName}/${link.number_of_persons}`, '_blank');
                                      }}
                                      title="Open Link"
                                      className="h-8 w-8"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => setDeleteId(link.id)}
                                      title="Delete Link"
                                      className="text-destructive hover:text-destructive h-8 w-8"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {/* Expanded Guest Rows */}
                              {isExpanded && linkInvitees.length > 0 && linkInvitees.map((invitee, inviteeIndex) => (
                                <TableRow 
                                  key={invitee.id}
                                  className={`${linkIndex % 2 === 0 ? 'bg-white' : 'bg-accent/5'} border-l-4 border-l-primary/20`}
                                >
                                  <TableCell></TableCell>
                                  <TableCell colSpan={3} className="pl-8 font-medium">
                                    {invitee.name}
                                  </TableCell>
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
                                  <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                    {invitee.is_attending !== null 
                                      ? `Responded: ${new Date(invitee.created_at).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}`
                                      : '-'}
                                  </TableCell>
                                </TableRow>
                              ))}

                              {/* Show message if no invitees */}
                              {isExpanded && linkInvitees.length === 0 && (
                                <TableRow className={linkIndex % 2 === 0 ? 'bg-white' : 'bg-accent/5'}>
                                  <TableCell></TableCell>
                                  <TableCell colSpan={5} className="text-center py-4 text-sm text-muted-foreground italic">
                                    No guests added to this invitation yet
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
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
