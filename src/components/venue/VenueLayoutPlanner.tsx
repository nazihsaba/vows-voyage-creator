import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VenueCanvas } from "./VenueCanvas";
import { VenueToolbar } from "./VenueToolbar";
import { VenuePropertiesPanel } from "./VenuePropertiesPanel";
import { Loader2, Save, CheckCircle2, Sparkles, Monitor } from "lucide-react";

export interface VenueTable {
  id: string;
  venue_project_id: string;
  name: string;
  shape: string;
  width: number;
  height: number;
  x_position: number;
  y_position: number;
  rotation: number;
  guest_count: number;
}

export interface VenueProject {
  id: string;
  wedding_id: string;
  name: string;
  plan_image_url: string | null;
  scale: number | null;
}

export interface VenueLayoutPlannerRef {
  clearAllTables: () => Promise<void>;
}

export interface VenueInvitee {
  name: string;
  table_number: number | null;
  is_attending: boolean | null;
}

interface Props {
  weddingId: string;
  invitees?: VenueInvitee[];
}

export const VenueLayoutPlanner = forwardRef<VenueLayoutPlannerRef, Props>(({ weddingId, invitees: externalInvitees = [] }, ref) => {
  const { toast } = useToast();
  const [project, setProject] = useState<VenueProject | null>(null);
  const [tables, setTables] = useState<VenueTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showPlanImage, setShowPlanImage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showGrid, setShowGrid] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasExportRef = useRef<HTMLDivElement>(null);

  const selectedTable = tables.find((t) => t.id === selectedTableId) || null;

  // Build occupancy map from invitees: table_number -> count of assigned guests
  const occupancyMap = React.useMemo(() => {
    const map: Record<number, number> = {};
    externalInvitees.forEach((inv) => {
      if (inv.table_number != null) {
        map[inv.table_number] = (map[inv.table_number] || 0) + 1;
      }
    });
    return map;
  }, [externalInvitees]);

  // Extract table number from name (e.g. "Table 3" -> 3, "Table 12" -> 12)
  const extractTableNumber = (name: string): number | null => {
    const match = name.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  // Enrich tables with real guest counts from invitee assignments
  const enrichedTables = React.useMemo(() => {
    return tables.map((t) => {
      const num = extractTableNumber(t.name);
      if (num !== null && occupancyMap[num] !== undefined) {
        return { ...t, guest_count: occupancyMap[num] };
      }
      return t;
    });
  }, [tables, occupancyMap]);

  const clearAllTables = async () => {
    if (!project) return;
    try {
      await supabase.from("venue_tables").delete().eq("venue_project_id", project.id);
      setTables([]);
      setSelectedTableId(null);
      toast({ title: "Cleared", description: "All tables have been removed." });
    } catch (err: any) {
      console.error("Error clearing tables:", err);
      toast({ title: "Error", description: "Failed to clear tables", variant: "destructive" });
    }
  };

  useImperativeHandle(ref, () => ({ clearAllTables }), [project, tables]);

  // Load or create project
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Ensure the auth session is hydrated before issuing RLS-protected requests.
        // Without this, an unauthenticated SELECT can return empty and trigger an
        // INSERT that gets rejected by row-level security.
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await new Promise<void>((resolve) => {
            const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
              if (s) {
                sub.subscription.unsubscribe();
                resolve();
              }
            });
            // Safety timeout so we don't hang forever on a logged-out user
            setTimeout(() => {
              sub.subscription.unsubscribe();
              resolve();
            }, 3000);
          });
        }
        const { data: projects, error } = await supabase
          .from("venue_projects")
          .select("*")
          .eq("wedding_id", weddingId);

        if (error) throw error;

        let proj: VenueProject;
        if (projects && projects.length > 0) {
          proj = projects[0] as VenueProject;
        } else {
          const { data: newProj, error: createErr } = await supabase
            .from("venue_projects")
            .insert({ wedding_id: weddingId, name: "Venue Layout" })
            .select()
            .single();
          if (createErr) throw createErr;
          proj = newProj as VenueProject;
        }
        setProject(proj);

        // Load tables
        const { data: tablesData, error: tablesErr } = await supabase
          .from("venue_tables")
          .select("*")
          .eq("venue_project_id", proj.id);

        if (tablesErr) throw tablesErr;
        setTables((tablesData || []) as VenueTable[]);
      } catch (err: any) {
        console.error("Error loading venue:", err);
        toast({ title: "Error", description: "Failed to load venue layout", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [weddingId]);

  const saveTables = useCallback(async (tablesToSave: VenueTable[]) => {
    setSaveStatus("saving");
    try {
      for (const table of tablesToSave) {
        const { error } = await supabase
          .from("venue_tables")
          .upsert({
            id: table.id,
            venue_project_id: table.venue_project_id,
            name: table.name,
            shape: table.shape,
            width: table.width,
            height: table.height,
            x_position: table.x_position,
            y_position: table.y_position,
            rotation: table.rotation,
            guest_count: table.guest_count,
          });
        if (error) throw error;
      }
      setSaveStatus("saved");
    } catch (err: any) {
      console.error("Error saving:", err);
      setSaveStatus("unsaved");
      toast({ title: "Error", description: "Failed to save layout", variant: "destructive" });
    }
  }, [toast]);

  const scheduleAutoSave = useCallback((tablesToSave: VenueTable[]) => {
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTables(tablesToSave);
    }, 1500);
  }, [saveTables]);

  // Trigger auto-save when tables change (but not on initial load)
  const tablesRef = useRef(tables);
  useEffect(() => {
    if (loading) return;
    if (tablesRef.current !== tables) {
      tablesRef.current = tables;
      scheduleAutoSave(tables);
    }
  }, [tables, loading, scheduleAutoSave]);

  const addTable = (shape: string) => {
    if (!project) return;
    const defaults: Record<string, { w: number; h: number }> = {
      round: { w: 100, h: 100 },
      oval: { w: 140, h: 100 },
      rectangle: { w: 150, h: 80 },
      square: { w: 100, h: 100 },
    };
    const { w, h } = defaults[shape] || defaults.round;
    const newTable: VenueTable = {
      id: crypto.randomUUID(),
      venue_project_id: project.id,
      name: `Table ${tables.length + 1}`,
      shape,
      width: w,
      height: h,
      x_position: 400 + Math.random() * 100,
      y_position: 300 + Math.random() * 100,
      rotation: 0,
      guest_count: shape === "round" || shape === "oval" ? 8 : 6,
    };
    setTables((prev) => [...prev, newTable]);
    setSelectedTableId(newTable.id);
  };

  const updateTable = (id: string, updates: Partial<VenueTable>) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTable = async (id: string) => {
    try {
      await supabase.from("venue_tables").delete().eq("id", id);
    } catch {}
    setTables((prev) => prev.filter((t) => t.id !== id));
    if (selectedTableId === id) setSelectedTableId(null);
  };

  const duplicateTable = (id: string) => {
    const original = tables.find((t) => t.id === id);
    if (!original || !project) return;
    const dup: VenueTable = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (copy)`,
      x_position: original.x_position + 30,
      y_position: original.y_position + 30,
    };
    setTables((prev) => [...prev, dup]);
    setSelectedTableId(dup.id);
  };

  const uploadPlanImage = async (file: File) => {
    if (!project) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/venue-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("wedding-images")
        .upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from("wedding-images")
        .getPublicUrl(path);

      await supabase
        .from("venue_projects")
        .update({ plan_image_url: publicUrl })
        .eq("id", project.id);

      setProject({ ...project, plan_image_url: publicUrl });
      toast({ title: "Plan uploaded", description: "Detecting tables..." });
      detectTables(publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  const removePlanImage = async () => {
    if (!project) return;
    await supabase.from("venue_projects").update({ plan_image_url: null }).eq("id", project.id);
    setProject({ ...project, plan_image_url: null });
  };

  const detectTables = async (imageUrl?: string) => {
    const url = imageUrl || project?.plan_image_url;
    if (!url || !project) return;
    setIsDetecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("detect-venue-tables", {
        body: { imageUrl: url },
      });
      if (error) throw error;
      if (!data?.tables || !Array.isArray(data.tables)) {
        throw new Error("No tables detected");
      }

      const IMAGE_WIDTH = 1000;
      // We need image aspect ratio to map y coordinates
      const img = new Image();
      img.src = url;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      const aspectRatio = img.naturalHeight / img.naturalWidth || 1;
      const imageHeight = IMAGE_WIDTH * aspectRatio;

      const newTables: VenueTable[] = data.tables.map((t: any, i: number) => {
        const w = Math.min(150, Math.max(30, (t.width_percent / 100) * IMAGE_WIDTH));
        const h = Math.min(150, Math.max(30, (t.height_percent / 100) * imageHeight));
        return {
          id: crypto.randomUUID(),
          venue_project_id: project.id,
          name: t.name || `Table ${i + 1}`,
          shape: ["round", "rectangle", "square", "oval"].includes(t.shape) ? t.shape : "round",
          width: Math.round(w),
          height: Math.round(h),
          x_position: Math.round((t.x_percent / 100) * IMAGE_WIDTH - w / 2),
          y_position: Math.round((t.y_percent / 100) * imageHeight - h / 2),
          rotation: 0,
          guest_count: t.guest_count || 0,
        };
      });

      setTables(newTables);
      setSelectedTableId(null);

      // Immediately persist detected tables
      await saveTables(newTables);

      // If the AI returned a cleaned image (tables removed), use it as background
      if (data.cleanedImageUrl) {
        await supabase
          .from("venue_projects")
          .update({ plan_image_url: data.cleanedImageUrl })
          .eq("id", project.id);
        setProject({ ...project, plan_image_url: data.cleanedImageUrl });
      }

      toast({ title: "Tables detected", description: `Found ${newTables.length} tables in your venue plan.` });
    } catch (err: any) {
      console.error("Detection error:", err);
      toast({ title: "Detection failed", description: err.message || "Could not detect tables", variant: "destructive" });
    } finally {
      setIsDetecting(false);
    }
  };

  const exportCanvasImage = async () => {
    if (!canvasExportRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(canvasExportRef.current, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `venue-layout-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Exported", description: "Venue layout image downloaded." });
    } catch (err: any) {
      console.error("Export error:", err);
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
    {/* Mobile block message */}
    <div className="flex sm:hidden flex-col items-center justify-center py-16 px-6 text-center gap-3">
      <Monitor className="w-10 h-10 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">Venue Layout Planner</p>
      <p className="text-xs text-muted-foreground">This feature is only available on desktop. Please switch to a larger screen to use the venue planner.</p>
    </div>

    {/* Desktop view */}
    <div className="hidden sm:flex flex-col h-[70vh] min-h-[500px] rounded-xl border border-border/30 overflow-hidden bg-muted/20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-background border-b border-border/30">
        <span className="text-sm font-medium text-foreground">{project?.name || "Venue Layout"}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Saved
            </>
          )}
          {saveStatus === "unsaved" && (
            <>
              <Save className="w-3 h-3" />
              Unsaved
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
         <VenueToolbar
          onAddTable={addTable}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onUploadPlan={uploadPlanImage}
          hasPlanImage={!!project?.plan_image_url}
          onRemovePlan={removePlanImage}
          onDetectTables={() => detectTables()}
          isDetecting={isDetecting}
          onExportImage={exportCanvasImage}
        />

        {/* Canvas */}
        <VenueCanvas
          tables={enrichedTables}
          selectedTableId={selectedTableId}
          onSelectTable={setSelectedTableId}
          onUpdateTable={updateTable}
          planImageUrl={project?.plan_image_url || null}
          showGrid={showGrid}
          exportRef={canvasExportRef}
        />

        {/* Properties panel */}
        <VenuePropertiesPanel
          table={selectedTable}
          onUpdate={(updates) => selectedTable && updateTable(selectedTable.id, updates)}
          onDelete={() => selectedTable && deleteTable(selectedTable.id)}
          onDuplicate={() => selectedTable && duplicateTable(selectedTable.id)}
        />
      </div>
    </div>
    </>
  );
});
