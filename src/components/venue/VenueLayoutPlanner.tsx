import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VenueCanvas } from "./VenueCanvas";
import { VenueToolbar } from "./VenueToolbar";
import { VenuePropertiesPanel } from "./VenuePropertiesPanel";
import { Loader2, Save, CheckCircle2 } from "lucide-react";

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

interface Props {
  weddingId: string;
}

export const VenueLayoutPlanner: React.FC<Props> = ({ weddingId }) => {
  const { toast } = useToast();
  const [project, setProject] = useState<VenueProject | null>(null);
  const [tables, setTables] = useState<VenueTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showGrid, setShowGrid] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedTable = tables.find((t) => t.id === selectedTableId) || null;

  // Load or create project
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
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

  const scheduleAutoSave = useCallback(() => {
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveAllTables();
    }, 1500);
  }, []);

  const saveAllTables = async () => {
    setSaveStatus("saving");
    try {
      // Upsert all tables
      for (const table of tables) {
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
  };

  // Trigger auto-save when tables change (but not on initial load)
  const tablesRef = useRef(tables);
  useEffect(() => {
    if (loading) return;
    if (tablesRef.current !== tables) {
      tablesRef.current = tables;
      scheduleAutoSave();
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
      toast({ title: "Plan uploaded", description: "Your venue plan has been set as the background." });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] min-h-[500px] rounded-xl border border-border/30 overflow-hidden bg-muted/20">
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
        />

        {/* Canvas */}
        <VenueCanvas
          tables={tables}
          selectedTableId={selectedTableId}
          onSelectTable={setSelectedTableId}
          onUpdateTable={updateTable}
          planImageUrl={project?.plan_image_url || null}
          showGrid={showGrid}
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
  );
};
