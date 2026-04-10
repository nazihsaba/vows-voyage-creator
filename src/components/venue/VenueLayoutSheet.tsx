import React, { useState, useCallback } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, Loader2, AlertCircle } from "lucide-react";
import { useVenueProject, VenueTable } from "@/hooks/useVenueProject";
import VenueCanvas from "./VenueCanvas";
import VenueToolbar from "./VenueToolbar";
import VenueTableProperties from "./VenueTableProperties";

interface VenueLayoutSheetProps {
  open: boolean;
  onClose: () => void;
  weddingId: string;
}

const VenueLayoutSheet: React.FC<VenueLayoutSheetProps> = ({ open, onClose, weddingId }) => {
  const {
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
  } = useVenueProject(weddingId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [editingName, setEditingName] = useState(false);

  const selectedTable = tables.find((t) => t.id === selectedId) || null;

  const handleUpdateTable = useCallback((id: string, updates: Partial<VenueTable>) => {
    const updated = tables.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    updateTables(updated);
  }, [tables, updateTables]);

  const handleAddTable = useCallback((shape: string) => {
    const id = addTable(shape);
    if (id) setSelectedId(id);
  }, [addTable]);

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
          </span>
        );
      case "saved":
        return (
          <span className="flex items-center gap-1.5 text-xs text-primary">
            <Check className="w-3 h-3" /> Saved
          </span>
        );
      case "error":
        return (
          <button
            onClick={retrySave}
            className="flex items-center gap-1.5 text-xs text-destructive hover:underline"
          >
            <AlertCircle className="w-3 h-3" /> Error — retry
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-none p-0 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
          <div className="flex items-center gap-3">
            {editingName && project ? (
              <Input
                value={project.name}
                onChange={(e) => updateProjectName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                className="h-7 text-sm w-48"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="text-sm font-semibold hover:text-primary transition-colors"
              >
                {project?.name || "Venue Layout"}
              </button>
            )}
            {renderSaveStatus()}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Left toolbar */}
            <VenueToolbar
              onAddTable={handleAddTable}
              onUploadPlan={uploadPlanImage}
              showGrid={showGrid}
              onToggleGrid={setShowGrid}
              zoom={zoom}
              onZoomIn={() => setZoom((z) => Math.min(z * 1.2, 5))}
              onZoomOut={() => setZoom((z) => Math.max(z / 1.2, 0.1))}
              onZoomReset={() => setZoom(1)}
            />

            {/* Center canvas */}
            <VenueCanvas
              tables={tables}
              selectedId={selectedId}
              onSelectTable={setSelectedId}
              onUpdateTable={handleUpdateTable}
              planImageUrl={project?.plan_image_url || null}
              showGrid={showGrid}
              zoom={zoom}
              onZoomChange={setZoom}
            />

            {/* Right properties panel */}
            {selectedTable && (
              <VenueTableProperties
                table={selectedTable}
                onChange={(updates) => handleUpdateTable(selectedTable.id, updates)}
                onDelete={() => {
                  deleteTable(selectedTable.id);
                  setSelectedId(null);
                }}
                onDuplicate={() => duplicateTable(selectedTable.id)}
              />
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default VenueLayoutSheet;
