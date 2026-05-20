import React, { useEffect, useState, useRef } from "react";
import { getGenerationState, subscribeGeneration } from "@/lib/linkGenerationQueue";
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
  Download,
  Grid2x2,
  MapPin,
  MoreVertical,
  Lock,
  CreditCard,
  Shield,
  AlertCircle,
  MessageCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { GenerateLinkDialog } from "@/components/GenerateLinkDialog";
import { VenueLayoutPlanner, type VenueLayoutPlannerRef } from "@/components/venue/VenueLayoutPlanner";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SeatingQRSection from "@/components/SeatingQRSection";

interface WeddingTable {
  id: string;
  table_number: number;
  name: string | null;
}

interface InvitationLink {
  id: string;
  link_name: string;
  unique_slug: string;
  number_of_persons: number;
  side: string | null;
  country_code: string | null;
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
  venue_payment_status?: string;
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
    country_code: "+961",
    phone_number: "",
  });
  const [editInvitees, setEditInvitees] = useState<Invitee[]>([]);
  const [originalInvitees, setOriginalInvitees] = useState<Invitee[]>([]);
  const [pendingNewInvitees, setPendingNewInvitees] = useState<Invitee[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, Partial<Invitee>>>({});
  const [newInviteeName, setNewInviteeName] = useState("");
  const [savingInvitee, setSavingInvitee] = useState(false);
  const [activeView, setActiveView] = useState<"guests" | "tables" | "venue">("guests");
  const venueRef = useRef<VenueLayoutPlannerRef>(null);
  const [statusFilter, setStatusFilter] = useState<"attending" | "pending" | "not_attending" | null>(null);
  const [sideFilter, setSideFilter] = useState<"GROOM" | "BRIDE" | null>(null);
  const [venuePayLoading, setVenuePayLoading] = useState(false);
  const [venuePayDialogOpen, setVenuePayDialogOpen] = useState(false);
  const [venuePayUrl, setVenuePayUrl] = useState<string | null>(null);
  const [venuePayError, setVenuePayError] = useState<string | null>(null);
  const [genState, setGenState] = useState(getGenerationState());
  const [weddingTables, setWeddingTables] = useState<WeddingTable[]>([]);
  const [createTableOpen, setCreateTableOpen] = useState(false);
  const [tableForm, setTableForm] = useState<{
    table_number: string;
    name: string;
    selectedInviteeIds: string[];
  }>({ table_number: "", name: "", selectedInviteeIds: [] });
  const [savingTable, setSavingTable] = useState(false);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [tableInviteeSearch, setTableInviteeSearch] = useState("");
  const [editingTable, setEditingTable] = useState<{ id: string | null; originalNumber: number } | null>(null);

  useEffect(() => {
    const unsub = subscribeGeneration((s) => {
      setGenState(s);
      if (s.status === "done" && s.weddingId === weddingId) {
        setRefresh((r) => r + 1);
      }
    });
    return () => {
      unsub();
    };
  }, [weddingId]);

  const isGenerating =
    genState.weddingId === weddingId &&
    (genState.status === "uploading" || genState.status === "polling");

  const isVenueUnlocked = wedding?.venue_payment_status === "paid";

  // Handle venue payment return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const venuePayment = params.get("venue_payment");
    if (venuePayment === "success") {
      toast({ title: "Venue Unlocked!", description: "You now have access to the venue layout planner." });
      setActiveView("venue");
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      setRefresh((r) => r + 1);
    } else if (venuePayment === "failed") {
      toast({
        title: "Payment Failed",
        description: "Venue payment was not completed. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (weddingId) {
      // Only show the full-page loading skeleton on the initial load; subsequent
      // refreshes (triggered by `refresh`) fetch silently so the user keeps
      // their scroll position and the list doesn't unmount.
      fetchData({ silent: refresh > 0 });
    }
  }, [weddingId, refresh]);

  const fetchData = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) setLoading(true);


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
          .order("created_at", { ascending: true });

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

      // Fetch wedding tables
      const { data: tablesData } = await (supabase as any)
        .from("wedding_tables")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("table_number", { ascending: true });
      setWeddingTables((tablesData || []) as WeddingTable[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load invitation links",
        variant: "destructive",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openCreateTableDialog = () => {
    // suggest next available table number
    const used = new Set<number>();
    weddingTables.forEach((t) => used.add(t.table_number));
    Object.values(invitees)
      .flat()
      .forEach((i) => {
        if (i.table_number != null) used.add(i.table_number);
      });
    let next = 1;
    while (used.has(next)) next++;
    setTableForm({ table_number: String(next), name: "", selectedInviteeIds: [] });
    setTableInviteeSearch("");
    setCreateTableOpen(true);
  };

  const handleCreateTable = async () => {
    if (!weddingId) return;
    const tableNum = parseInt(tableForm.table_number);
    if (!tableNum || tableNum < 1) {
      toast({ title: "Invalid table number", description: "Enter a positive number", variant: "destructive" });
      return;
    }
    // Check uniqueness against existing tables
    if (weddingTables.some((t) => t.table_number === tableNum)) {
      toast({ title: "Table exists", description: `Table ${tableNum} already exists`, variant: "destructive" });
      return;
    }
    setSavingTable(true);
    try {
      const { error: tErr } = await (supabase as any).from("wedding_tables").insert({
        wedding_id: weddingId,
        table_number: tableNum,
        name: tableForm.name.trim() || null,
      });
      if (tErr) throw tErr;

      if (tableForm.selectedInviteeIds.length > 0) {
        const { error: uErr } = await (supabase as any)
          .from("invitees")
          .update({ table_number: tableNum })
          .in("id", tableForm.selectedInviteeIds);
        if (uErr) throw uErr;
      }
      toast({ title: "Table created", description: `Table ${tableNum} has been added` });
      setCreateTableOpen(false);
      setRefresh((r) => r + 1);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to create table", variant: "destructive" });
    } finally {
      setSavingTable(false);
    }
  };

  const handleDeleteTable = async (tableNum: number) => {
    if (!weddingId) return;
    try {
      // Unassign invitees from this table
      await (supabase as any)
        .from("invitees")
        .update({ table_number: null })
        .eq("table_number", tableNum)
        .in(
          "invitation_link_id",
          links.map((l) => l.id),
        );
      await (supabase as any)
        .from("wedding_tables")
        .delete()
        .eq("wedding_id", weddingId)
        .eq("table_number", tableNum);
      toast({ title: "Table deleted", description: `Table ${tableNum} removed` });
      setDeleteTableId(null);
      setRefresh((r) => r + 1);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete table", variant: "destructive" });
    }
  };

  const openEditTableDialog = (tableNum: number) => {
    const t = weddingTables.find((wt) => wt.table_number === tableNum);
    const assigned = Object.values(invitees)
      .flat()
      .filter((i) => i.table_number === tableNum)
      .map((i) => i.id);
    setTableForm({
      table_number: String(tableNum),
      name: t?.name ?? "",
      selectedInviteeIds: assigned,
    });
    setTableInviteeSearch("");
    setEditingTable({ id: t?.id ?? null, originalNumber: tableNum });
  };

  const handleSaveTableEdit = async () => {
    if (!editingTable || !weddingId) return;
    const newNum = parseInt(tableForm.table_number);
    if (!newNum || newNum < 1) {
      toast({ title: "Invalid table number", description: "Enter a positive number", variant: "destructive" });
      return;
    }
    if (newNum !== editingTable.originalNumber && weddingTables.some((t) => t.table_number === newNum)) {
      toast({ title: "Table exists", description: `Table ${newNum} already exists`, variant: "destructive" });
      return;
    }
    setSavingTable(true);
    try {
      const trimmedName = tableForm.name.trim() || null;
      let savedTableId = editingTable.id;
      // Upsert the wedding_tables row (create one if this was an unmanaged table)
      if (editingTable.id) {
        const { error: tErr } = await (supabase as any)
          .from("wedding_tables")
          .update({ table_number: newNum, name: trimmedName })
          .eq("id", editingTable.id);
        if (tErr) throw tErr;
      } else {
        const { data: inserted, error: tErr } = await (supabase as any)
          .from("wedding_tables")
          .insert({
            wedding_id: weddingId,
            table_number: newNum,
            name: trimmedName,
          })
          .select()
          .single();
        if (tErr) throw tErr;
        savedTableId = inserted?.id ?? null;
      }

      const originallyAssignedIds = Object.values(invitees)
        .flat()
        .filter((i) => i.table_number === editingTable.originalNumber)
        .map((i) => i.id);
      const selectedSet = new Set(tableForm.selectedInviteeIds);

      // Unassign invitees that were on this table but were deselected
      const toUnassign = originallyAssignedIds.filter((id) => !selectedSet.has(id));
      if (toUnassign.length > 0) {
        const { error: uErr } = await (supabase as any)
          .from("invitees")
          .update({ table_number: null })
          .in("id", toUnassign);
        if (uErr) throw uErr;
      }

      // Assign selected invitees to the new table number (covers number change & newly added)
      if (tableForm.selectedInviteeIds.length > 0) {
        const { error: aErr } = await (supabase as any)
          .from("invitees")
          .update({ table_number: newNum })
          .in("id", tableForm.selectedInviteeIds);
        if (aErr) throw aErr;
      }

      // Optimistically update local state so the UI reflects changes instantly
      // without waiting for a full refetch.
      setWeddingTables((prev) => {
        const next = prev.filter((t) => t.table_number !== editingTable.originalNumber);
        const existingIdx = next.findIndex((t) => t.table_number === newNum);
        const row = {
          id: savedTableId ?? `temp-${newNum}`,
          wedding_id: weddingId,
          table_number: newNum,
          name: trimmedName,
        } as WeddingTable;
        if (existingIdx >= 0) next[existingIdx] = row;
        else next.push(row);
        return next.sort((a, b) => a.table_number - b.table_number);
      });

      const unassignSet = new Set(toUnassign);
      const assignSet = new Set(tableForm.selectedInviteeIds);
      setInvitees((prev) => {
        const next: Record<string, typeof prev[string]> = {};
        for (const [k, list] of Object.entries(prev)) {
          next[k] = list.map((i) => {
            if (assignSet.has(i.id)) return { ...i, table_number: newNum };
            if (unassignSet.has(i.id)) return { ...i, table_number: null };
            // If table number itself changed, migrate any others still on the old number
            if (i.table_number === editingTable.originalNumber && newNum !== editingTable.originalNumber) {
              return { ...i, table_number: newNum };
            }
            return i;
          });
        }
        return next;
      });

      toast({ title: "Table updated", description: `Table ${newNum} saved` });
      setEditingTable(null);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to update table", variant: "destructive" });
    } finally {
      setSavingTable(false);
    }
  };

  const getInviteUrl = (linkName: string, numberOfPersons: number) => {
    const sanitizedLinkName = linkName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const siteOrigin = "https://go.aureainvites.com";
    return `${siteOrigin}/invite/${wedding?.slug}/${sanitizedLinkName}/${numberOfPersons}`;
  };

  // Shared invitation message used both for WhatsApp button and clipboard copy,
  // ensuring a consistent sharing experience whether the user clicks "Send via
  // WhatsApp" or copies the link and pastes it manually elsewhere.
  const buildInvitationMessage = (linkName: string, inviteUrl: string) => {
    return `${inviteUrl}\n\nDear ${linkName},\n\nWith love and joy, we — *${wedding?.groom_name} & ${wedding?.bride_name}* — invite you to celebrate our wedding! ❤️\n\nWe would be honored to have you with us on this beautiful day. ✨\n\nWe can't wait to see you! 💕`;
  };

  const copyToClipboard = async (linkName: string, numberOfPersons: number) => {
    const inviteUrl = getInviteUrl(linkName, numberOfPersons);
    const message = buildInvitationMessage(linkName, inviteUrl);
    await navigator.clipboard.writeText(message);
    toast({
      title: "Copied!",
      description: "Invitation message copied — paste it anywhere to share",
    });
  };

  const buildWhatsAppUrl = (phoneNumber: string, message: string) => {
    const phone = phoneNumber.replace(/[^0-9]/g, "");
    return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(message)}`;
  };

  // Combine country code + phone number for outbound calls. Backward-compatible:
  // legacy rows may still have the country code embedded in phone_number (country_code NULL).
  const getFullPhone = (link: InvitationLink): string | null => {
    if (!link.phone_number) return null;
    if (link.country_code) return `${link.country_code} ${link.phone_number}`;
    return link.phone_number;
  };

  const openWhatsApp = (link: InvitationLink) => {
    const full = getFullPhone(link);
    if (!full) return;
    const inviteUrl = getInviteUrl(link.link_name, link.number_of_persons);
    const message = buildInvitationMessage(link.link_name, inviteUrl);
    window.open(buildWhatsAppUrl(full, message), "_blank");
  };

  const openWhatsAppFollowUp = (link: InvitationLink) => {
    const full = getFullPhone(link);
    if (!full) return;
    const inviteUrl = getInviteUrl(link.link_name, link.number_of_persons);
    const message = `Hi ${link.link_name} 😊\n\nJust a gentle reminder! We’d love to know if you’ll be joining us for our special day. 🌸\n\nIf you haven’t already, please confirm your attendance here:\n${inviteUrl}\n\nWe truly hope to see you there! ❤️`;
    window.open(buildWhatsAppUrl(full, message), "_blank");
  };

  const openEditDialog = (link: InvitationLink) => {
    setEditingLink(link);
    // Backward-compat: legacy rows may still have a combined "+<cc><digits>" stored in phone_number
    // with country_code = NULL. Split on the fly so the inputs always show separated values.
    let cc = link.country_code ?? "";
    let phone = link.phone_number ?? "";
    if (!cc && phone) {
      const match = phone.match(/^(\+\d{1,4})(.*)$/);
      if (match) {
        cc = match[1];
        phone = match[2];
      }
    }
    setEditForm({
      link_name: link.link_name,
      number_of_persons: link.number_of_persons,
      side: link.side || "NONE",
      country_code: cc || "+961",
      phone_number: phone,
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

  const handleMoveInvitee = (index: number, direction: -1 | 1) => {
    setEditInvitees((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleEditSave = async () => {
    if (!editingLink || !editForm.number_of_persons) return;
    try {
      // Save link fields
      const trimmedPhone = editForm.phone_number.trim();
      const trimmedCc = editForm.country_code.trim();
      const { error: linkError } = await (supabase as any)
        .from("invitation_links")
        .update({
          link_name: editForm.link_name.replace(/\b\w/g, (c) => c.toUpperCase()),
          number_of_persons: editForm.number_of_persons,
          side: editForm.side === "NONE" ? null : editForm.side || null,
          country_code: trimmedPhone ? trimmedCc || null : null,
          phone_number: trimmedPhone || null,
        })
        .eq("id", editingLink.id);
      if (linkError) throw linkError;

      // Delete removed invitees
      for (const id of pendingDeleteIds) {
        const { error } = await supabase.from("invitees").delete().eq("id", id);
        if (error) throw error;
      }

      // Insert new invitees (with display order based on current position)
      for (const inv of pendingNewInvitees) {
        const order = editInvitees.findIndex((i) => i.id === inv.id);
        const { error } = await supabase.from("invitees").insert({
          invitation_link_id: inv.invitation_link_id,
          name: inv.name.replace(/\b\w/g, (c) => c.toUpperCase()),
          is_attending: inv.is_attending,
          table_number: inv.table_number,
          display_order: order >= 0 ? order : 0,
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

      // Persist display order for existing invitees whose position changed
      for (let i = 0; i < editInvitees.length; i++) {
        const inv = editInvitees[i];
        if (inv.id.startsWith("temp-")) continue;
        if (pendingDeleteIds.includes(inv.id)) continue;
        const { error } = await (supabase as any)
          .from("invitees")
          .update({ display_order: i })
          .eq("id", inv.id);
        if (error) throw error;
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

  const [deletingAll, setDeletingAll] = useState(false);

  const deleteAllLinks = async () => {
    setDeletingAll(true);
    setDeleteAllOpen(false);
    try {
      const ids = links.map((l) => l.id);
      if (ids.length > 0) {
        const { error } = await supabase.from("invitation_links").delete().in("id", ids);
        if (error) throw error;
      }
      toast({ title: "Success", description: "All links deleted successfully" });
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting all links:", error);
      toast({ title: "Error", description: "Failed to delete all links", variant: "destructive" });
    } finally {
      setDeletingAll(false);
    }
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
    if (sideFilter && (link.side || "").toUpperCase() !== sideFilter) return false;

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

  const exportGuestList = () => {
    const rows: any[] = [];
    filteredLinks.forEach((link) => {
      const linkInvitees = (invitees[link.id] || []).filter((invitee) => {
        if (!statusFilter) return true;
        if (statusFilter === "attending") return invitee.is_attending === true;
        if (statusFilter === "not_attending") return invitee.is_attending === false;
        if (statusFilter === "pending") return invitee.is_attending === null;
        return true;
      });
      linkInvitees.forEach((invitee) => {
        rows.push({
          "Link Name": link.link_name,
          Side: link.side || "—",
          "Guest Name": invitee.name,
          "Table #": invitee.table_number ?? "—",
          Status:
            invitee.is_attending === true ? "Attending" : invitee.is_attending === false ? "Not Attending" : "Pending",
        });
      });
    });
    if (rows.length === 0) {
      toast({ title: "No data", description: "No guests to export", variant: "destructive" });
      return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guest List");
    XLSX.writeFile(wb, `guest_list_${wedding?.slug || "export"}.xlsx`);
  };

  const exportTableOccupancy = () => {
    const allInvitees = Object.values(invitees).flat();
    const tableMap: Record<number, Invitee[]> = {};
    allInvitees.forEach((inv) => {
      if (inv.table_number != null) {
        if (!tableMap[inv.table_number]) tableMap[inv.table_number] = [];
        tableMap[inv.table_number].push(inv);
      }
    });
    const rows: any[] = [];
    Object.keys(tableMap)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((tableNum) => {
        const tableInfo = weddingTables.find((t) => t.table_number === Number(tableNum));
        tableMap[Number(tableNum)].forEach((inv) => {
          const link = links.find((l) => l.id === inv.invitation_link_id);
          rows.push({
            "Group Name": link?.link_name || "—",
            "Guest Name": inv.name,
            "Table Number": Number(tableNum),
            "Table Name": tableInfo?.name || "",
          });
        });
      });
    if (rows.length === 0) {
      toast({ title: "No data", description: "No table assignments to export", variant: "destructive" });
      return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Table Occupancy");
    XLSX.writeFile(wb, `table_occupancy_${wedding?.slug || "export"}.xlsx`);
  };

  const handleVenuePayment = () => {
    setVenuePayDialogOpen(true);
    setVenuePayUrl(null);
    setVenuePayError(null);
  };

  const handleVenuePayProceed = async () => {
    if (!weddingId) return;
    setVenuePayLoading(true);
    setVenuePayError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("whish-pay-collect", {
        body: {
          weddingId,
          amount: 30,
          currency: "USD",
          invoice: `Venue Layout Planner - $30`,
          type: "venue",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.collectUrl) {
        setVenuePayUrl(data.collectUrl);
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err: any) {
      console.error("Venue payment error:", err);
      setVenuePayError(err.message || "Could not initiate payment");
    } finally {
      setVenuePayLoading(false);
    }
  };

  const handleCloseVenuePayDialog = () => {
    setVenuePayDialogOpen(false);
    setVenuePayUrl(null);
    setVenuePayError(null);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {deletingAll && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl px-8 py-10 max-w-sm w-full flex flex-col items-center text-center gap-4">
            <Loader2 className="w-12 h-12 text-destructive animate-spin" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Deleting all links</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Removing all invitation links and guests. Please wait...
              </p>
            </div>
          </div>
        </div>
      )}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl px-8 py-10 max-w-sm w-full flex flex-col items-center text-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Generating your links
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {genState.message || "Please wait while we create your invitation links and guests..."}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                This may take a minute. Please don't close this page.
              </p>
            </div>
          </div>
        </div>
      )}
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
                  <span className="text-xl font-['great-vibes'] font-semibold text-foreground">
                    Invitation Links & Guests
                  </span>
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
                                    : "bg-amber-100 text-[#865814] hover:bg-amber-200"
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
                    Guests
                  </Button>
                  <Button
                    variant={activeView === "tables" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveView("tables")}
                    className="rounded-md text-xs h-8 px-3"
                  >
                    <Grid2x2 className="w-3.5 h-3.5 mr-1.5" />
                    Tables
                  </Button>
                  <Button
                    variant={activeView === "venue" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => (isVenueUnlocked ? setActiveView("venue") : handleVenuePayment())}
                    className="hidden sm:inline-flex rounded-md text-xs h-8 px-3"
                    disabled={venuePayLoading}
                  >
                    {venuePayLoading ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : !isVenueUnlocked ? (
                      <Lock className="w-3.5 h-3.5 mr-1.5" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Venue
                    {!isVenueUnlocked && <span className="ml-1 text-[10px] opacity-70">$30</span>}
                  </Button>
                </div>
                {(activeView === "venue" || links.length > 0) && (
                  <>
                    {/* Desktop buttons */}
                    <div className="hidden sm:flex items-center gap-2">
                      {activeView !== "venue" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={activeView === "guests" ? exportGuestList : exportTableOccupancy}
                          className="rounded-full text-xs h-8 px-3"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          {activeView === "guests" ? "Export Guest List" : "Export Tables"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (activeView === "venue") {
                            venueRef.current?.clearAllTables();
                          } else {
                            setDeleteAllOpen(true);
                          }
                        }}
                        className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 text-xs h-8 px-3"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        {activeView === "venue" ? "Clear All" : "Delete All"}
                      </Button>
                    </div>
                    {/* Mobile dropdown */}
                    <div className="sm:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {activeView !== "venue" && (
                            <>
                              <DropdownMenuItem
                                onClick={activeView === "guests" ? exportGuestList : exportTableOccupancy}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {activeView === "guests" ? "Export Guest List" : "Export Tables"}
                              </DropdownMenuItem>
                            </>
                          )}
                          {activeView !== "venue" && (
                            <DropdownMenuItem
                              onClick={() => (isVenueUnlocked ? setActiveView("venue") : handleVenuePayment())}
                              disabled={venuePayLoading}
                            >
                              {venuePayLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : !isVenueUnlocked ? (
                                <Lock className="w-4 h-4 mr-2" />
                              ) : (
                                <MapPin className="w-4 h-4 mr-2" />
                              )}
                              Venue
                              {!isVenueUnlocked && <span className="ml-1 text-[10px] opacity-70">$30</span>}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              if (activeView === "venue") {
                                venueRef.current?.clearAllTables();
                              } else {
                                setDeleteAllOpen(true);
                              }
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {activeView === "venue" ? "Clear All" : "Delete All"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
              </div>

              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out will-change-transform"
                  style={{
                    transform:
                      activeView === "tables"
                        ? "translateX(-100%)"
                        : activeView === "venue"
                          ? "translateX(-200%)"
                          : "translateX(0)",
                  }}
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
                                Phone
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
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                                      <TableCell className="text-sm text-muted-foreground">
                                        {getFullPhone(link) ?? "—"}
                                      </TableCell>
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
                                            className="bg-amber-100 text-[#865814] border-0 text-xs font-medium"
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
                                            {link.phone_number && stats.pending > 0 && (
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => openWhatsAppFollowUp(link)}
                                                title="Follow up via WhatsApp"
                                                className="h-8 w-8 rounded-full hover:bg-amber-50 hover:shadow-sm transition-all text-amber-600"
                                              >
                                                <MessageCircle className="w-3.5 h-3.5" />
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
                                                  className="bg-amber-100 text-[#865814] border-0 text-xs font-medium"
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
                                          colSpan={7}
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
                                      className="bg-amber-100 text-[#865814] border-0 text-[10px] px-1.5 py-0.5 font-medium"
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
                                  <div onClick={(e) => e.stopPropagation()}>
                                    {/* Desktop / tablet: inline icon toolbar */}
                                    <div className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-muted/40 p-0.5">
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
                                      {link.phone_number && stats.pending > 0 && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => openWhatsAppFollowUp(link)}
                                          title="Follow up via WhatsApp"
                                          className="h-7 w-7 rounded-full hover:bg-amber-50 hover:shadow-sm transition-all text-amber-600"
                                        >
                                          <MessageCircle className="w-3 h-3" />
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

                                    {/* Mobile: 3-dot dropdown menu */}
                                    <div className="sm:hidden">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 rounded-full hover:bg-muted/60"
                                            title="Actions"
                                          >
                                            <MoreVertical className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-background z-50">
                                          {link.phone_number && (
                                            <DropdownMenuItem onClick={() => openWhatsApp(link)}>
                                              <img src={whatsappIcon} alt="WhatsApp" className="w-4 h-4 mr-2" />
                                              Send via WhatsApp
                                            </DropdownMenuItem>
                                          )}
                                          {link.phone_number && stats.pending > 0 && (
                                            <DropdownMenuItem onClick={() => openWhatsAppFollowUp(link)}>
                                              <MessageCircle className="w-4 h-4 mr-2 text-amber-600" />
                                              Follow up
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem
                                            onClick={() => copyToClipboard(link.link_name, link.number_of_persons)}
                                          >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy Link
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
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
                                          >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Open Link
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => openEditDialog(link)}>
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Edit Link
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => setDeleteId(link.id)}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Link
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
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
                                          <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {invitee.table_number != null && (
                                              <Badge
                                                variant="secondary"
                                                className="bg-muted text-muted-foreground border-0 text-[10px] font-medium"
                                              >
                                                Table {invitee.table_number}
                                              </Badge>
                                            )}
                                            {invitee.is_attending === null ? (
                                              <Badge
                                                variant="secondary"
                                                className="bg-amber-100 text-[#865814] border-0 text-[10px] font-medium"
                                              >
                                                Pending
                                              </Badge>
                                            ) : invitee.is_attending ? (
                                              <Badge
                                                variant="secondary"
                                                className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-medium"
                                              >
                                                Attending
                                              </Badge>
                                            ) : (
                                              <Badge
                                                variant="secondary"
                                                className="bg-red-100 text-red-700 border-0 text-[10px] font-medium"
                                              >
                                                Not Attending
                                              </Badge>
                                            )}
                                          </div>
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
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">Tables</h3>
                      <Button
                        size="sm"
                        onClick={openCreateTableDialog}
                        className="rounded-full text-xs h-8 px-3"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Create Table
                      </Button>
                    </div>
                    {(() => {
                      const tableMap: Record<
                        number,
                        {
                          total: number;
                          attending: number;
                          inviteeList: { name: string; is_attending: boolean | null }[];
                        }
                      > = {};
                      // Seed with explicitly-created tables (so empty ones show)
                      weddingTables.forEach((t) => {
                        tableMap[t.table_number] = { total: 0, attending: 0, inviteeList: [] };
                      });
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
                      const nameByNum: Record<number, string | null> = {};
                      weddingTables.forEach((t) => {
                        nameByNum[t.table_number] = t.name;
                      });
                      const tableNumbers = Object.keys(tableMap)
                        .map(Number)
                        .sort((a, b) => a - b);
                      if (tableNumbers.length === 0)
                        return (
                          <div className="text-center py-12 text-muted-foreground text-sm">
                            No tables yet. Click "Create Table" to add one.
                          </div>
                        );
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {tableNumbers.map((tableNum) => {
                            const { total, attending, inviteeList } = tableMap[tableNum];
                            const isFull = attending >= total && total > 0;
                            const isTableExpanded = !collapsedTables.includes(tableNum);
                            const customName = nameByNum[tableNum];
                            const isManagedTable = weddingTables.some((t) => t.table_number === tableNum);
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
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {isTableExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    )}
                                    <span className="font-semibold text-sm text-foreground truncate">
                                      Table {tableNum}
                                      {customName ? ` · ${customName}` : ""}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
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
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditTableDialog(tableNum);
                                      }}
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteTableId(String(tableNum));
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                {isTableExpanded && (
                                  <div className="mt-2 space-y-1 border-t pt-2">
                                    {inviteeList.length === 0 ? (
                                      <div className="text-[11px] text-muted-foreground italic">
                                        No invitees seated yet
                                      </div>
                                    ) : (
                                      inviteeList.map((inv, i) => (
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
                                              className="bg-amber-100 text-[#865814] border-0 text-[10px] px-1.5 py-0"
                                            >
                                              Pending
                                            </Badge>
                                          )}
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {wedding?.slug && <SeatingQRSection weddingSlug={wedding.slug} />}
                  </div>

                  {/* Venue Panel */}
                  <div className="w-full flex-shrink-0">
                    {weddingId && isVenueUnlocked ? (
                      <VenueLayoutPlanner
                        ref={venueRef}
                        weddingId={weddingId}
                        invitees={Object.values(invitees)
                          .flat()
                          .map((i) => ({ name: i.name, table_number: i.table_number, is_attending: i.is_attending }))}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Lock className="w-12 h-12 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Venue Layout Planner</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                          Unlock the venue layout planner to upload floor plans, detect tables with AI, and manage your
                          seating arrangement visually.
                        </p>
                        <Button onClick={handleVenuePayment} disabled={venuePayLoading} className="rounded-full px-6">
                          {venuePayLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4 mr-2" />
                          )}
                          Unlock for $30
                        </Button>
                      </div>
                    )}
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

            <div className="space-y-1.5">
              <Label htmlFor="edit-phone" className="text-xs sm:text-sm font-medium">
                Phone Number
              </Label>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                Used for WhatsApp invitations and reminders.
              </p>
              <div className="flex gap-1.5">
                <Input
                  id="edit-country-code"
                  placeholder="+961"
                  value={editForm.country_code}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, country_code: e.target.value }))}
                  className="h-11 text-base sm:h-9 sm:text-sm w-20 shrink-0"
                />
                <Input
                  id="edit-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="e.g., 71123456"
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone_number: e.target.value }))}
                  className="h-11 text-base sm:h-9 sm:text-sm"
                />
              </div>
            </div>

            {/* Invitees Section */}
            <div className="space-y-2 pt-3 border-t">
              <Label className="text-sm font-medium">Guests ({editInvitees.length})</Label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {editInvitees.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">No guests added yet</p>
                ) : (
                  editInvitees.map((invitee, idx) => (
                    <div
                      key={invitee.id}
                      className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5 sm:py-2"
                    >
                      <div className="flex flex-col flex-shrink-0 mr-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-4 w-5 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={idx === 0}
                          onClick={() => handleMoveInvitee(idx, -1)}
                          aria-label="Move guest up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-4 w-5 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={idx === editInvitees.length - 1}
                          onClick={() => handleMoveInvitee(idx, 1)}
                          aria-label="Move guest down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
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
                            className="bg-amber-100 text-[#865814] border-0 text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
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

      {/* Venue Payment Dialog */}
      <Dialog open={venuePayDialogOpen} onOpenChange={handleCloseVenuePayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Unlock Venue Planner
            </DialogTitle>
            <DialogDescription>
              {wedding && (
                <span>
                  Unlock the venue layout planner for{" "}
                  <strong>
                    {wedding.bride_name} & {wedding.groom_name}
                  </strong>
                  's event
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {!venuePayUrl && !venuePayError && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Venue Layout Planner</span>
                  <span className="font-semibold">$30 USD</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Payment is processed securely via Whish Pay. Once confirmed, the venue planner will be unlocked.
              </p>
            </div>
          )}

          {venuePayUrl && (
            <div className="space-y-4 text-center">
              <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm">
                Payment link created! Click below to complete your payment.
              </div>
              <Button asChild className="w-full rounded-full">
                <a href={venuePayUrl} target="_blank" rel="noopener noreferrer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </a>
              </Button>
            </div>
          )}

          {venuePayError && (
            <div className="space-y-4">
              <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{venuePayError}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            {!venuePayUrl && !venuePayError && (
              <Button onClick={handleVenuePayProceed} disabled={venuePayLoading} className="w-full rounded-full">
                {venuePayLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            )}
            {venuePayError && (
              <Button onClick={handleVenuePayProceed} className="w-full rounded-full">
                Try Again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Table Dialog */}
      <Dialog
        open={createTableOpen || !!editingTable}
        onOpenChange={(o) => {
          if (!o) {
            setCreateTableOpen(false);
            setEditingTable(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editingTable ? "Edit Table" : "Create Table"}</DialogTitle>
            <DialogDescription>
              Set the table number and optionally a name, then choose who sits at this table.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="t-num">Table Number *</Label>
                <Input
                  id="t-num"
                  type="number"
                  min={1}
                  value={tableForm.table_number}
                  onChange={(e) => setTableForm((f) => ({ ...f, table_number: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="t-name">Table Name (optional)</Label>
                <Input
                  id="t-name"
                  placeholder="e.g. Family"
                  value={tableForm.name}
                  onChange={(e) => setTableForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Select invitees</Label>
              <div className="relative mt-2 mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={tableInviteeSearch}
                  onChange={(e) => setTableInviteeSearch(e.target.value)}
                  placeholder="Search invitees..."
                  className="pl-8 h-9"
                />
              </div>
              <Tabs defaultValue="without" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="without" className="text-[11px] sm:text-xs px-1">Without Table</TabsTrigger>
                  <TabsTrigger value="with" className="text-[11px] sm:text-xs px-1">With Table</TabsTrigger>
                </TabsList>
                {(["without", "with"] as const).map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-2">
                    <div className="border rounded-lg max-h-64 sm:max-h-80 overflow-y-auto divide-y">
                      {(() => {
                        const all = Object.values(invitees).flat();
                        if (all.length === 0) {
                          return (
                            <div className="p-3 text-xs text-muted-foreground text-center">
                              No invitees yet. Add invitees to a group first.
                            </div>
                          );
                        }
                        const q = tableInviteeSearch.trim().toLowerCase();
                        const scoped = all.filter((i) => {
                          const isOnThisTable =
                            editingTable && i.table_number === editingTable.originalNumber;
                          const hasTable = i.table_number != null && !isOnThisTable;
                          return tab === "with" ? hasTable : !hasTable;
                        });
                        const filtered = q ? scoped.filter((i) => i.name.toLowerCase().includes(q)) : scoped;
                        if (filtered.length === 0) {
                          return (
                            <div className="p-3 text-xs text-muted-foreground text-center">
                              {q ? `No invitees match "${tableInviteeSearch}"` : "No invitees in this group."}
                            </div>
                          );
                        }
                        return filtered.map((inv) => {
                          const checked = tableForm.selectedInviteeIds.includes(inv.id);
                          const currentTable = inv.table_number;
                          const isOnThisTable =
                            editingTable && currentTable === editingTable.originalNumber;
                          return (
                            <label
                              key={inv.id}
                              className="flex items-center gap-2 p-2.5 text-sm cursor-pointer hover:bg-muted/40"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  setTableForm((f) => ({
                                    ...f,
                                    selectedInviteeIds: v
                                      ? [...f.selectedInviteeIds, inv.id]
                                      : f.selectedInviteeIds.filter((id) => id !== inv.id),
                                  }));
                                }}
                              />
                              <span className="flex-1 truncate">{inv.name}</span>
                              {currentTable != null && !isOnThisTable && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  Table {currentTable}
                                </Badge>
                              )}
                            </label>
                          );
                        });
                      })()}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              {tableForm.selectedInviteeIds.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {tableForm.selectedInviteeIds.length} selected. Re-assigning invitees from another table will move
                  them here.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateTableOpen(false);
                setEditingTable(null);
              }}
              disabled={savingTable}
            >
              Cancel
            </Button>
            <Button onClick={editingTable ? handleSaveTableEdit : handleCreateTable} disabled={savingTable}>
              {savingTable ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingTable ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTableId} onOpenChange={(o) => !o && setDeleteTableId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table {deleteTableId}?</AlertDialogTitle>
            <AlertDialogDescription>
              Any invitees seated at this table will be unassigned. This won't delete the invitees themselves.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTableId && handleDeleteTable(parseInt(deleteTableId))}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageLinks;
