import React, { useEffect, useState } from "react";
import whatsappIcon from "@/assets/whatsappIcon.png";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Copy,
  Eye,
  Trash2,
  Check,
  X,
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Link2,
  Pencil,
} from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InvitationLink {
  id: string;
  link_name: string;
  unique_slug: string;
  number_of_persons: number;
  side: string | null;
  phone_number: string | null;
  created_at: string;
}

interface Invitee {
  id: string;
  name: string;
  is_attending: boolean | null;
  invitation_link_id: string;
  created_at: string;
  table_number: number | null;
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
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [generateLinkOpen, setGenerateLinkOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [expandedLinks, setExpandedLinks] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedTables, setCollapsedTables] = useState<number[]>([]);
  const [editingLink, setEditingLink] = useState<InvitationLink | null>(null);
  const [editForm, setEditForm] = useState({
    link_name: "",
    number_of_persons: 1 as number | string,
    side: "",
  });
  const [editInvitees, setEditInvitees] = useState<Invitee[]>([]);
  const [originalInvitees, setOriginalInvitees] = useState<Invitee[]>([]);
  const [pendingNewInvitees, setPendingNewInvitees] = useState<Invitee[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, Partial<Invitee>>>({});
  const [newInviteeName, setNewInviteeName] = useState("");
  const [savingInvitee, setSavingInvitee] = useState(false);
  const [activeView, setActiveView] = useState<"guests" | "tables">("guests");
  const [statusFilter, setStatusFilter] = useState<"attending" | "pending" | "not_attending" | null>(null);
  const [sideFilter, setSideFilter] = useState<"GROOM" | "BRIDE" | null>(null);

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
        const linkIds = linksData.map((link) => link.id);
        const { data: inviteesData, error: inviteesError } = await (supabase as any)
          .from("invitees")
          .select("*")
          .in("invitation_link_id", linkIds)
          .order("name");

        if (inviteesError) throw inviteesError;

        // Group invitees by invitation_link_id
        const groupedInvitees: Record<string, Invitee[]> = {};
        ((inviteesData || []) as Invitee[]).forEach((invitee) => {
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

  const getInviteUrl = (linkName: string, numberOfPersons: number) => {
    const sanitizedLinkName = linkName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const siteOrigin = "https://aureainvites.com";
    return `${siteOrigin}/invite/${wedding?.slug}/${sanitizedLinkName}/${numberOfPersons}`;
  };

  const copyToClipboard = async (linkName: string, numberOfPersons: number) => {
    const inviteUrl = getInviteUrl(linkName, numberOfPersons);
    await navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Copied!",
      description: "Invitation link copied",
    });
  };

  const openWhatsApp = (link: InvitationLink) => {
    if (!link.phone_number) return;
    const inviteUrl = getInviteUrl(link.link_name, link.number_of_persons);
    const message = encodeURIComponent(
      `Dear ${link.link_name},\n\nWith love and joy, we invite you to celebrate our wedding 💍✨\n\nWe would be honored to have you with us on this beautiful day.\n\nCheck your invitation here:\n${inviteUrl}`,
    );
    const phone = link.phone_number.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const openEditDialog = (link: InvitationLink) => {
    setEditingLink(link);
    setEditForm({
      link_name: link.link_name,
      number_of_persons: link.number_of_persons,
      side: link.side || "NONE",
    });
    setNewInviteeName("");
    const linkInvitees = invitees[link.id] || [];
    setEditInvitees([...linkInvitees]);
    setOriginalInvitees([...linkInvitees]);
    setPendingNewInvitees([]);
    setPendingDeleteIds([]);
    setPendingUpdates({});
  };

  const handleAddInvitee = () => {
    if (!editingLink || !newInviteeName.trim()) return;
    const tempInvitee: Invitee = {
      id: `temp-${Date.now()}-${Math.random()}`,
      name: newInviteeName.trim(),
      is_attending: null,
      invitation_link_id: editingLink.id,
      created_at: new Date().toISOString(),
      table_number: null,
    };
    setEditInvitees((prev) => [...prev, tempInvitee]);
    setPendingNewInvitees((prev) => [...prev, tempInvitee]);
    setNewInviteeName("");
  };

  const handleDeleteInvitee = (inviteeId: string) => {
    setEditInvitees((prev) => prev.filter((i) => i.id !== inviteeId));
    if (inviteeId.startsWith("temp-")) {
      setPendingNewInvitees((prev) => prev.filter((i) => i.id !== inviteeId));
    } else {
      setPendingDeleteIds((prev) => [...prev, inviteeId]);
    }
  };

  const handleToggleInviteeStatus = (inviteeId: string, currentStatus: boolean | null) => {
    const nextStatus = currentStatus === null ? true : currentStatus === true ? false : null;
    setEditInvitees((prev) => prev.map((i) => (i.id === inviteeId ? { ...i, is_attending: nextStatus } : i)));
    if (!inviteeId.startsWith("temp-")) {
      setPendingUpdates((prev) => ({
        ...prev,
        [inviteeId]: { ...prev[inviteeId], is_attending: nextStatus },
      }));
    } else {
      setPendingNewInvitees((prev) => prev.map((i) => (i.id === inviteeId ? { ...i, is_attending: nextStatus } : i)));
    }
  };

  const handleUpdateInviteeTable = (inviteeId: string, tableNum: string) => {
    const value = tableNum ? parseInt(tableNum) : null;
    setEditInvitees((prev) => prev.map((i) => (i.id === inviteeId ? { ...i, table_number: value } : i)));
    if (!inviteeId.startsWith("temp-")) {
      setPendingUpdates((prev) => ({
        ...prev,
        [inviteeId]: { ...prev[inviteeId], table_number: value },
      }));
    } else {
      setPendingNewInvitees((prev) => prev.map((i) => (i.id === inviteeId ? { ...i, table_number: value } : i)));
    }
  };

  const handleEditSave = async () => {
    if (!editingLink || !editForm.number_of_persons) return;
    try {
      // Save link fields
      const { error: linkError } = await (supabase as any)
        .from("invitation_links")
        .update({
          link_name: editForm.link_name.replace(/\b\w/g, (c) => c.toUpperCase()),
          number_of_persons: editForm.number_of_persons,
          side: editForm.side === "NONE" ? null : editForm.side || null,
        })
        .eq("id", editingLink.id);
      if (linkError) throw linkError;

      // Delete removed invitees
      for (const id of pendingDeleteIds) {
        const { error } = await supabase.from("invitees").delete().eq("id", id);
        if (error) throw error;
      }

      // Insert new invitees
      for (const inv of pendingNewInvitees) {
        const { error } = await supabase.from("invitees").insert({
          invitation_link_id: inv.invitation_link_id,
          name: inv.name.replace(/\b\w/g, (c) => c.toUpperCase()),
          is_attending: inv.is_attending,
          table_number: inv.table_number,
        } as any);
        if (error) throw error;
      }

      // Update modified invitees
      for (const [id, updates] of Object.entries(pendingUpdates)) {
        if (!pendingDeleteIds.includes(id)) {
          const sanitizedUpdates = { ...(updates as any) };
          if (sanitizedUpdates.name) {
            sanitizedUpdates.name = sanitizedUpdates.name.replace(/\b\w/g, (c: string) => c.toUpperCase());
          }
          const { error } = await supabase.from("invitees").update(sanitizedUpdates).eq("id", id);
          if (error) throw error;
        }
      }

      toast({ title: "Success", description: "Link updated successfully" });
      setEditingLink(null);
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase.from("invitation_links").delete().eq("id", linkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link deleted successfully",
      });

      setRefresh((prev) => prev + 1);
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

  const deleteAllLinks = async () => {
    try {
      for (const link of links) {
        const { error } = await supabase.from("invitation_links").delete().eq("id", link.id);
        if (error) throw error;
      }
      toast({ title: "Success", description: "All links deleted successfully" });
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting all links:", error);
      toast({ title: "Error", description: "Failed to delete all links", variant: "destructive" });
    }
    setDeleteAllOpen(false);
  };

  const getRSVPStats = (linkId: string) => {
    const linkInvitees = invitees[linkId] || [];
    const attending = linkInvitees.filter((i) => i.is_attending === true).length;
    const notAttending = linkInvitees.filter((i) => i.is_attending === false).length;
    const pending = linkInvitees.filter((i) => i.is_attending === null).length;

    return { attending, notAttending, pending, total: linkInvitees.length };
  };

  const toggleLink = (linkId: string) => {
    setExpandedLinks((prev) => ({
      ...prev,
      [linkId]: !prev[linkId],
    }));
  };

  const filteredLinks = links.filter((link) => {
    const linkInvitees = invitees[link.id] || [];
    const matchesLinkName = link.link_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGuestName = linkInvitees.some((invitee) =>
      invitee.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const matchesSearch = matchesLinkName || matchesGuestName;

    // Side filter
    if (sideFilter && link.side !== sideFilter) return false;

    if (!statusFilter) return matchesSearch;

    // Filter: only show links that have at least one invitee matching the status
    const hasMatchingStatus = linkInvitees.some((invitee) => {
      if (statusFilter === "attending") return invitee.is_attending === true;
      if (statusFilter === "not_attending") return invitee.is_attending === false;
      if (statusFilter === "pending") return invitee.is_attending === null;
      return true;
    });
    return matchesSearch && hasMatchingStatus;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-foreground">Manage Links</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {wedding.bride_name} & {wedding.groom_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setGenerateLinkOpen(true)}
              className="rounded-full px-4 sm:px-5 shadow-sm hover:shadow-md transition-all text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Generate Link
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/my-events")}
              className="rounded-full border-border/60 hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {links.length === 0 ? (
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-5">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-serif font-semibold mb-2">No Links Yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Generate your first invitation link to get started</p>
              <Button onClick={() => setGenerateLinkOpen(true)} className="rounded-full px-6 shadow-sm">
                Generate Your First Link
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-['great-vibes'] font-semibold text-foreground">
                    Invitation Links & Guests
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredLinks.length} {filteredLinks.length === 1 ? "link" : "links"} •{" "}
                    {Object.values(invitees).flat().length} total guests
                  </p>
                  {(() => {
                    const allInvitees = Object.values(invitees).flat();
                    const attending = allInvitees.filter((i) => i.is_attending === true).length;
                    const notAttending = allInvitees.filter((i) => i.is_attending === false).length;
                    const pending = allInvitees.filter((i) => i.is_attending === null).length;
                    const toggleFilter = (filter: "attending" | "pending" | "not_attending") => {
                      setStatusFilter((prev) => (prev === filter ? null : filter));
                    };
                    return (
                      <TooltipProvider>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                onClick={() => toggleFilter("attending")}
                                className={`cursor-pointer transition-all text-xs font-medium border-0 ${
                                  statusFilter === "attending"
                                    ? "bg-emerald-200 text-emerald-800 ring-2 ring-emerald-400"
                                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                }`}
                              >
                                <Check className="w-3 h-3 mr-1" /> {attending} attending
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {statusFilter === "attending"
                                ? "Click to clear filter and show all guests"
                                : `Show only confirmed guests (${attending} out of ${attending + pending + notAttending})`}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                onClick={() => toggleFilter("pending")}
                                className={`cursor-pointer transition-all text-xs font-medium border-0 ${
                                  statusFilter === "pending"
                                    ? "bg-amber-200 text-amber-800 ring-2 ring-amber-400"
                                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                }`}
                              >
                                <Loader2 className="w-3 h-3 mr-1" /> {pending} pending
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {statusFilter === "pending"
                                ? "Click to clear filter and show all guests"
                                : `Show only guests who haven't responded yet (${pending} out of ${attending + pending + notAttending})`}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                onClick={() => toggleFilter("not_attending")}
                                className={`cursor-pointer transition-all text-xs font-medium border-0 ${
                                  statusFilter === "not_attending"
                                    ? "bg-red-200 text-red-800 ring-2 ring-red-400"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                              >
                                <X className="w-3 h-3 mr-1" /> {notAttending} not attending
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {statusFilter === "not_attending"
                                ? "Click to clear filter and show all guests"
                                : `Show only declined guests (${notAttending} out of ${attending + pending + notAttending})`}
                            </TooltipContent>
                          </Tooltip>
                          <span className="w-px h-4 bg-border/50 mx-1" />
                          <Select
                            value={sideFilter || "all"}
                            onValueChange={(val) => setSideFilter(val === "all" ? null : (val as "GROOM" | "BRIDE"))}
                          >
                            <SelectTrigger className="h-6 w-auto min-w-[90px] text-xs rounded-full border-0 bg-muted/60 px-2.5 gap-1">
                              <SelectValue placeholder="Side" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Both Sides</SelectItem>
                              <SelectItem value="GROOM">Groom</SelectItem>
                              <SelectItem value="BRIDE">Bride</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TooltipProvider>
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
              {/* View Toggle Tabs */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex gap-1 p-1 rounded-lg bg-muted/40 w-fit">
                  <Button
                    variant={activeView === "guests" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveView("guests")}
                    className="rounded-md text-xs h-8 px-3"
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Guest List
                  </Button>
                  <Button
                    variant={activeView === "tables" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveView("tables")}
                    className="rounded-md text-xs h-8 px-3"
                  >
                    Table Occupancy
                  </Button>
                </div>
                {links.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteAllOpen(true)}
                    className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 text-xs h-8 px-3"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:mr-1" />
                    <span className="hidden sm:inline">Delete All</span>
                  </Button>
                )}
              </div>

              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out will-change-transform"
                  style={{ transform: activeView === "tables" ? "translateX(-100%)" : "translateX(0)" }}
                >
                  {/* Guests Panel */}
                  <div className="w-full flex-shrink-0">
                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-xl overflow-hidden border border-border/30">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-primary/10 border-b border-primary/20">
                              <TableHead className="w-12"></TableHead>
                              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                Link Name
                              </TableHead>
                              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                Side
                              </TableHead>
                              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                Table #
                              </TableHead>

                              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                Guests
                              </TableHead>
                              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                RSVP
                              </TableHead>
                              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredLinks.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                  {searchQuery
                                    ? "No invitation links or guests match your search"
                                    : "No invitation links created yet"}
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredLinks.map((link, linkIndex) => {
                                const linkInvitees = invitees[link.id] || [];
                                const stats = getRSVPStats(link.id);
                                const isExpanded = expandedLinks[link.id] || false;
                                return (
                                  <React.Fragment key={link.id}>
                                    <TableRow
                                      className={`${linkIndex % 2 === 0 ? "bg-background" : "bg-muted/40"} transition-all duration-200 cursor-pointer border-b border-border/30`}
                                      onClick={() => toggleLink(link.id)}
                                    >
                                      <TableCell>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                          {isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4" />
                                          )}
                                        </Button>
                                      </TableCell>
                                      <TableCell className="font-semibold text-foreground">{link.link_name}</TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {link.side ? (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs font-medium border-0 bg-white text-foreground"
                                          >
                                            {link.side}
                                          </Badge>
                                        ) : (
                                          <span className="text-muted-foreground/50">—</span>
                                        )}
                                      </TableCell>
                                      <TableCell></TableCell>

                                      <TableCell>
                                        <div className="flex items-center gap-1.5">
                                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span className="text-sm font-medium">{stats.total}</span>
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex flex-wrap gap-1.5">
                                          <Badge
                                            variant="secondary"
                                            className="bg-emerald-100 text-emerald-700 border-0 text-xs font-medium"
                                          >
                                            {stats.attending}
                                          </Badge>
                                          <Badge
                                            variant="secondary"
                                            className="bg-amber-100 text-amber-700 border-0 text-xs font-medium"
                                          >
                                            {stats.pending}
                                          </Badge>
                                          <Badge
                                            variant="secondary"
                                            className="bg-red-100 text-red-700 border-0 text-xs font-medium"
                                          >
                                            {stats.notAttending}
                                          </Badge>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                                          <div className="inline-flex items-center gap-0.5 rounded-full bg-muted/40 p-0.5">
                                            {link.phone_number && (
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => openWhatsApp(link)}
                                                title="Send via WhatsApp"
                                                className="h-8 w-8 rounded-full hover:bg-emerald-50 hover:shadow-sm transition-all text-emerald-600"
                                              >
                                                <img src={whatsappIcon} alt="WhatsApp" className="w-4 h-4" />
                                              </Button>
                                            )}
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={() => copyToClipboard(link.link_name, link.number_of_persons)}
                                              title="Copy Link"
                                              className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm transition-all"
                                            >
                                              <Copy className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={() => {
                                                const s = link.link_name
                                                  .toLowerCase()
                                                  .replace(/[^a-z0-9]+/g, "-")
                                                  .replace(/^-+|-+$/g, "");
                                                window.open(
                                                  `/invite/${wedding?.slug}/${s}/${link.number_of_persons}`,
                                                  "_blank",
                                                );
                                              }}
                                              title="Open Link"
                                              className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm transition-all"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={() => openEditDialog(link)}
                                              title="Edit Link"
                                              className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm transition-all"
                                            >
                                              <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={() => setDeleteId(link.id)}
                                              title="Delete Link"
                                              className="h-8 w-8 rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                    {isExpanded &&
                                      linkInvitees.length > 0 &&
                                      linkInvitees
                                        .filter((invitee) => {
                                          if (!statusFilter) return true;
                                          if (statusFilter === "attending") return invitee.is_attending === true;
                                          if (statusFilter === "not_attending") return invitee.is_attending === false;
                                          if (statusFilter === "pending") return invitee.is_attending === null;
                                          return true;
                                        })
                                        .map((invitee) => (
                                          <TableRow
                                            key={invitee.id}
                                            className="bg-white border-l-4 border-l-primary/30 transition-colors"
                                          >
                                            <TableCell></TableCell>
                                            <TableCell className="pl-8 font-medium">{invitee.name}</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell className="text-sm">
                                              {invitee.table_number != null ? (
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs font-medium border-0 bg-white"
                                                >
                                                  {invitee.table_number}
                                                </Badge>
                                              ) : (
                                                <span className="text-muted-foreground/50">—</span>
                                              )}
                                            </TableCell>
                                            <TableCell></TableCell>
                                            <TableCell>
                                              {invitee.is_attending === null ? (
                                                <Badge
                                                  variant="secondary"
                                                  className="bg-amber-100 text-amber-700 border-0 text-xs font-medium"
                                                >
                                                  Pending
                                                </Badge>
                                              ) : invitee.is_attending ? (
                                                <Badge
                                                  variant="secondary"
                                                  className="bg-emerald-100 text-emerald-700 border-0 text-xs font-medium"
                                                >
                                                  Attending
                                                </Badge>
                                              ) : (
                                                <Badge
                                                  variant="secondary"
                                                  className="bg-red-100 text-red-700 border-0 text-xs font-medium"
                                                >
                                                  Not Attending
                                                </Badge>
                                              )}
                                            </TableCell>
                                            <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                              {invitee.is_attending !== null
                                                ? `Responded: ${new Date(invitee.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                                                : "-"}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                    {isExpanded && linkInvitees.length === 0 && (
                                      <TableRow className="bg-muted/20">
                                        <TableCell></TableCell>
                                        <TableCell
                                          colSpan={6}
                                          className="text-center py-4 text-sm text-muted-foreground italic"
                                        >
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

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {filteredLinks.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground text-sm">
                          {searchQuery
                            ? "No invitation links or guests match your search"
                            : "No invitation links created yet"}
                        </p>
                      ) : (
                        filteredLinks.map((link) => {
                          const linkInvitees = invitees[link.id] || [];
                          const stats = getRSVPStats(link.id);
                          const isExpanded = expandedLinks[link.id] || false;
                          return (
                            <div
                              key={link.id}
                              className="rounded-xl border border-border/30 bg-card overflow-hidden shadow-sm"
                            >
                              <div
                                className="p-3 cursor-pointer bg-background active:bg-primary/10 transition-colors"
                                onClick={() => toggleLink(link.id)}
                              >
                                {/* Row 1: Chevron + Name + Side Badge */}
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <h3 className="font-semibold text-foreground text-sm truncate font-['great-vibes'] flex-1 min-w-0">
                                    {link.link_name}
                                  </h3>
                                  {link.side && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] font-medium border-0 flex-shrink-0 bg-white text-foreground"
                                    >
                                      {link.side === "GROOM" ? "Groom" : "Bride"}
                                    </Badge>
                                  )}
                                </div>

                                {/* Row 2: Meta info */}
                                <div className="flex items-center gap-3 mt-1.5 ml-8">
                                  {(() => {
                                    const linkInvs = invitees[link.id] || [];
                                    const tables = [
                                      ...new Set(linkInvs.map((i) => i.table_number).filter((t) => t != null)),
                                    ];
                                    return tables.length > 0 ? (
                                      <span className="text-[11px] text-muted-foreground">
                                        Table {tables.join(", ")}
                                      </span>
                                    ) : null;
                                  })()}
                                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Users className="w-3 h-3" />
                                    <span>
                                      {stats.total} {stats.total === 1 ? "guest" : "guests"}
                                    </span>
                                  </span>
                                </div>

                                {/* Row 3: Attendance badges (left) + Action buttons (right) */}
                                <div className="flex items-center justify-between mt-2 ml-8">
                                  <div className="flex gap-1.5">
                                    <Badge
                                      variant="secondary"
                                      className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0.5 font-medium"
                                    >
                                      {stats.attending}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0.5 font-medium"
                                    >
                                      {stats.pending}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="bg-red-100 text-red-700 border-0 text-[10px] px-1.5 py-0.5 font-medium"
                                    >
                                      {stats.notAttending}
                                    </Badge>
                                  </div>
                                  <div
                                    className="inline-flex items-center gap-0.5 rounded-full bg-muted/40 p-0.5"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {link.phone_number && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => openWhatsApp(link)}
                                        title="Send via WhatsApp"
                                        className="h-7 w-7 rounded-full hover:bg-emerald-50 hover:shadow-sm transition-all text-emerald-600"
                                      >
                                        <img src={whatsappIcon} alt="WhatsApp" className="w-3.5 h-3.5" />
                                      </Button>
                                    )}
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(link.link_name, link.number_of_persons)}
                                      title="Copy Link"
                                      className="h-7 w-7 rounded-full hover:bg-white hover:shadow-sm transition-all"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>

                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        const sanitizedLinkName = link.link_name
                                          .toLowerCase()
                                          .replace(/[^a-z0-9]+/g, "-")
                                          .replace(/^-+|-+$/g, "");
                                        window.open(
                                          `/invite/${wedding?.slug}/${sanitizedLinkName}/${link.number_of_persons}`,
                                          "_blank",
                                        );
                                      }}
                                      title="Open Link"
                                      className="h-7 w-7 rounded-full hover:bg-white hover:shadow-sm transition-all"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => openEditDialog(link)}
                                      title="Edit Link"
                                      className="h-7 w-7 rounded-full hover:bg-white hover:shadow-sm transition-all"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => setDeleteId(link.id)}
                                      title="Delete Link"
                                      className="h-7 w-7 rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="border-t border-border/20 bg-muted/30">
                                  {linkInvitees.length === 0 ? (
                                    <p className="text-center py-4 text-sm text-muted-foreground italic">
                                      No guests added yet
                                    </p>
                                  ) : (
                                    linkInvitees
                                      .filter((invitee) => {
                                        if (!statusFilter) return true;
                                        if (statusFilter === "attending") return invitee.is_attending === true;
                                        if (statusFilter === "not_attending") return invitee.is_attending === false;
                                        if (statusFilter === "pending") return invitee.is_attending === null;
                                        return true;
                                      })
                                      .map((invitee) => (
                                        <div
                                          key={invitee.id}
                                          className="flex items-center justify-between px-4 py-2.5 border-b border-border/10 last:border-b-0 bg-white"
                                        >
                                          <span className="text-sm font-medium text-foreground truncate mr-2">
                                            {invitee.name}
                                          </span>
                                          {invitee.is_attending === null ? (
                                            <Badge
                                              variant="secondary"
                                              className="bg-amber-100 text-amber-700 border-0 text-[10px] flex-shrink-0 font-medium"
                                            >
                                              Pending
                                            </Badge>
                                          ) : invitee.is_attending ? (
                                            <Badge
                                              variant="secondary"
                                              className="bg-emerald-100 text-emerald-700 border-0 text-[10px] flex-shrink-0 font-medium"
                                            >
                                              Yes
                                            </Badge>
                                          ) : (
                                            <Badge
                                              variant="secondary"
                                              className="bg-red-100 text-red-700 border-0 text-[10px] flex-shrink-0 font-medium"
                                            >
                                              No
                                            </Badge>
                                          )}
                                        </div>
                                      ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Tables Panel */}
                  <div className="w-full flex-shrink-0">
                    {(() => {
                      const tableMap: Record<
                        number,
                        {
                          total: number;
                          attending: number;
                          inviteeList: { name: string; is_attending: boolean | null }[];
                        }
                      > = {};
                      Object.values(invitees)
                        .flat()
                        .forEach((invitee) => {
                          if (invitee.table_number != null) {
                            if (!tableMap[invitee.table_number]) {
                              tableMap[invitee.table_number] = { total: 0, attending: 0, inviteeList: [] };
                            }
                            tableMap[invitee.table_number].total += 1;
                            if (invitee.is_attending === true) {
                              tableMap[invitee.table_number].attending += 1;
                            }
                            tableMap[invitee.table_number].inviteeList.push({
                              name: invitee.name,
                              is_attending: invitee.is_attending,
                            });
                          }
                        });
                      const tableNumbers = Object.keys(tableMap)
                        .map(Number)
                        .sort((a, b) => a - b);
                      if (tableNumbers.length === 0)
                        return (
                          <div className="text-center py-12 text-muted-foreground text-sm">
                            No table numbers assigned yet. Edit a group to assign a table number.
                          </div>
                        );
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {tableNumbers.map((tableNum) => {
                            const { total, attending, inviteeList } = tableMap[tableNum];
                            const isFull = attending >= total && total > 0;
                            const isTableExpanded = !collapsedTables.includes(tableNum);
                            return (
                              <div
                                key={tableNum}
                                className={`rounded-xl border p-4 ${isFull ? "bg-emerald-50 border-emerald-200" : "bg-background border-border/50"}`}
                              >
                                <div
                                  className="flex items-center justify-between cursor-pointer"
                                  onClick={() =>
                                    setCollapsedTables((prev) =>
                                      prev.includes(tableNum)
                                        ? prev.filter((t) => t !== tableNum)
                                        : [...prev, tableNum],
                                    )
                                  }
                                >
                                  <div className="flex items-center gap-1.5">
                                    {isTableExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                    )}
                                    <span className="font-semibold text-sm text-foreground">Table {tableNum}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                      {attending}/{total} attending
                                    </span>
                                    {isFull && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0"
                                      >
                                        Full
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {isTableExpanded && (
                                  <div className="mt-2 space-y-1 border-t pt-2">
                                    {inviteeList.map((inv, i) => (
                                      <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="truncate mr-2 text-foreground">{inv.name}</span>
                                        {inv.is_attending === true ? (
                                          <Badge
                                            variant="secondary"
                                            className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0"
                                          >
                                            Attending
                                          </Badge>
                                        ) : inv.is_attending === false ? (
                                          <Badge
                                            variant="secondary"
                                            className="bg-red-100 text-red-700 border-0 text-[10px] px-1.5 py-0"
                                          >
                                            Not Attending
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="secondary"
                                            className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0"
                                          >
                                            Pending
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
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
              This action cannot be undone. This will permanently delete the invitation link and all associated invitee
              responses.
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

      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all links?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all {links.length} invitation links and all
              associated invitee responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAllLinks}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
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
          onSuccess={() => setRefresh((prev) => prev + 1)}
        />
      )}

      {/* Edit Link Dialog */}
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-2xl sm:rounded-lg p-4 sm:p-6">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-lg sm:text-xl">Edit Invitation Link</DialogTitle>
            <DialogDescription className="text-sm">Update the details and manage guests.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 overflow-y-auto flex-1 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div className="space-y-1.5">
              <Label htmlFor="edit-link-name" className="text-sm font-medium">
                Link Name
              </Label>
              <Input
                id="edit-link-name"
                value={editForm.link_name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, link_name: e.target.value }))}
                className="h-11 text-base sm:h-9 sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-[1.2fr_1fr] gap-2 sm:gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-guests" className="text-xs sm:text-sm font-medium">
                  Number of Guests
                </Label>
                <Input
                  id="edit-guests"
                  type="number"
                  min={1}
                  value={editForm.number_of_persons}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      number_of_persons: e.target.value === "" ? "" : parseInt(e.target.value) || "",
                    }))
                  }
                  className="h-11 text-base sm:h-9 sm:text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-medium">Side</Label>
                <Select
                  value={editForm.side}
                  onValueChange={(value) => setEditForm((prev) => ({ ...prev, side: value }))}
                >
                  <SelectTrigger className="h-11 text-base sm:h-9 sm:text-sm">
                    <SelectValue placeholder="Side" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GROOM">Groom</SelectItem>
                    <SelectItem value="BRIDE">Bride</SelectItem>
                    <SelectItem value="NONE">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Invitees Section */}
            <div className="space-y-2 pt-3 border-t">
              <Label className="text-sm font-medium">Guests ({editInvitees.length})</Label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {editInvitees.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">No guests added yet</p>
                ) : (
                  editInvitees.map((invitee) => (
                    <div
                      key={invitee.id}
                      className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5 sm:py-2"
                    >
                      <span className="text-sm font-medium truncate mr-2 flex-1 min-w-0">{invitee.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">Table #</span>
                          <Input
                            type="number"
                            min={1}
                            placeholder="T#"
                            value={invitee.table_number ?? ""}
                            onChange={(e) => handleUpdateInviteeTable(invitee.id, e.target.value)}
                            className="h-7 w-14 text-xs text-center px-1"
                          />
                        </div>
                        {invitee.is_attending === null ? (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 border-0 text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleToggleInviteeStatus(invitee.id, invitee.is_attending)}
                          >
                            Pending
                          </Badge>
                        ) : invitee.is_attending ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleToggleInviteeStatus(invitee.id, invitee.is_attending)}
                          >
                            Yes
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-700 border-0 text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleToggleInviteeStatus(invitee.id, invitee.is_attending)}
                          >
                            No
                          </Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 sm:h-6 sm:w-6 text-destructive/70 hover:text-destructive"
                          onClick={() => handleDeleteInvitee(invitee.id)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Guest name"
                  value={newInviteeName}
                  onChange={(e) => setNewInviteeName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddInvitee()}
                  className="h-11 text-base sm:h-9 sm:text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleAddInvitee}
                  disabled={
                    !newInviteeName.trim() ||
                    savingInvitee ||
                    !editForm.number_of_persons ||
                    editInvitees.length >= Number(editForm.number_of_persons)
                  }
                  className="flex-shrink-0 h-11 sm:h-9 px-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-3 border-t">
            <Button
              onClick={handleEditSave}
              disabled={
                !editForm.link_name.trim() ||
                !editForm.number_of_persons ||
                editInvitees.length !== editForm.number_of_persons
              }
              className="w-full sm:w-auto h-11 sm:h-9 text-base sm:text-sm"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditingLink(null)}
              className="w-full sm:w-auto h-11 sm:h-9 text-base sm:text-sm"
            >
              Close
            </Button>
            {editInvitees.length !== editForm.number_of_persons && (
              <p className="text-xs text-destructive w-full text-center sm:text-right">
                {editInvitees.length} of {editForm.number_of_persons} guests added
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageLinks;
