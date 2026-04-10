import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

type SaveStatus = "saved" | "saving" | "error" | "idle";

export function useVenueProject(weddingId: string) {
  const [project, setProject] = useState<VenueProject | null>(null);
  const [tables, setTables] = useState<VenueTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const { toast } = useToast();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tablesRef = useRef<VenueTable[]>([]);

  // Keep ref in sync
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  // Fetch or create project
  useEffect(() => {
    if (!weddingId) return;
    const init = async () => {
      setLoading(true);
      try {
        // Try to fetch existing project
        const { data: existing, error: fetchErr } = await supabase
          .from("venue_projects")
          .select("*")
          .eq("wedding_id", weddingId)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        let proj: VenueProject;
        if (existing) {
          proj = existing as VenueProject;
        } else {
          const { data: created, error: createErr } = await supabase
            .from("venue_projects")
            .insert({ wedding_id: weddingId })
            .select()
            .single();
          if (createErr) throw createErr;
          proj = created as VenueProject;
        }
        setProject(proj);

        // Fetch tables
        const { data: tblData, error: tblErr } = await supabase
          .from("venue_tables")
          .select("*")
          .eq("venue_project_id", proj.id);
        if (tblErr) throw tblErr;
        setTables((tblData || []) as VenueTable[]);
        setSaveStatus("saved");
      } catch (err: any) {
        console.error("Failed to init venue project:", err);
        toast({ title: "Error loading venue layout", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [weddingId]);

  const persistTables = useCallback(async (tablesToSave: VenueTable[]) => {
    if (!project) return;
    setSaveStatus("saving");
    try {
      // Upsert all tables
      const rows = tablesToSave.map((t) => ({
        id: t.id,
        venue_project_id: project.id,
        name: t.name,
        shape: t.shape,
        width: t.width,
        height: t.height,
        x_position: t.x_position,
        y_position: t.y_position,
        rotation: t.rotation,
        guest_count: t.guest_count,
      }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from("venue_tables")
          .upsert(rows, { onConflict: "id" });
        if (error) throw error;
      }

      // Update project updated_at
      await supabase
        .from("venue_projects")
        .update({ name: project.name })
        .eq("id", project.id);

      setSaveStatus("saved");
    } catch (err: any) {
      console.error("Save failed:", err);
      setSaveStatus("error");
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  }, [project, toast]);

  const debouncedSave = useCallback((updatedTables: VenueTable[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistTables(updatedTables);
    }, 1500);
  }, [persistTables]);

  const updateTables = useCallback((newTables: VenueTable[]) => {
    setTables(newTables);
    debouncedSave(newTables);
  }, [debouncedSave]);

  const addTable = useCallback((shape: string = "round") => {
    if (!project) return;
    const id = crypto.randomUUID();
    const newTable: VenueTable = {
      id,
      venue_project_id: project.id,
      name: `Table ${tables.length + 1}`,
      shape,
      width: shape === "round" ? 100 : 120,
      height: 100,
      x_position: 300 + Math.random() * 200,
      y_position: 200 + Math.random() * 200,
      rotation: 0,
      guest_count: 0,
    };
    const updated = [...tables, newTable];
    updateTables(updated);
    return id;
  }, [project, tables, updateTables]);

  const deleteTable = useCallback(async (tableId: string) => {
    try {
      const { error } = await supabase
        .from("venue_tables")
        .delete()
        .eq("id", tableId);
      if (error) throw error;
      const updated = tables.filter((t) => t.id !== tableId);
      setTables(updated);
      setSaveStatus("saved");
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  }, [tables, toast]);

  const duplicateTable = useCallback((tableId: string) => {
    const source = tables.find((t) => t.id === tableId);
    if (!source || !project) return;
    const id = crypto.randomUUID();
    const dup: VenueTable = {
      ...source,
      id,
      name: `${source.name} (copy)`,
      x_position: source.x_position + 30,
      y_position: source.y_position + 30,
    };
    updateTables([...tables, dup]);
  }, [tables, project, updateTables]);

  const uploadPlanImage = useCallback(async (file: File) => {
    if (!project) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/venue-plan-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("wedding-images")
        .upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("wedding-images")
        .getPublicUrl(path);

      const { error: updateErr } = await supabase
        .from("venue_projects")
        .update({ plan_image_url: urlData.publicUrl })
        .eq("id", project.id);
      if (updateErr) throw updateErr;

      setProject({ ...project, plan_image_url: urlData.publicUrl });
      toast({ title: "Venue plan uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  }, [project, toast]);

  const updateProjectName = useCallback(async (name: string) => {
    if (!project) return;
    setProject({ ...project, name });
    try {
      await supabase.from("venue_projects").update({ name }).eq("id", project.id);
    } catch (err: any) {
      console.error("Failed to update name:", err);
    }
  }, [project]);

  const retrySave = useCallback(() => {
    persistTables(tablesRef.current);
  }, [persistTables]);

  return {
    project,
    tables,
    loading,
    saveStatus,
    updateTables,
    addTable,
    deleteTable,
    duplicateTable,
    uploadPlanImage,
    updateProjectName,
    retrySave,
  };
}
