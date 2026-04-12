import React, { useRef, useState, useCallback, useEffect } from "react";
import type { VenueTable } from "./VenueLayoutPlanner";

interface Props {
  tables: VenueTable[];
  selectedTableId: string | null;
  onSelectTable: (id: string | null) => void;
  onUpdateTable: (id: string, updates: Partial<VenueTable>) => void;
  planImageUrl: string | null;
  showGrid: boolean;
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

export const VenueCanvas: React.FC<Props> = ({
  tables,
  selectedTableId,
  onSelectTable,
  onUpdateTable,
  planImageUrl,
  showGrid,
  exportRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<{ id: string; handle: string; startX: number; startY: number; startW: number; startH: number; startPosX: number; startPosY: number; isRound: boolean } | null>(null);
  const [rotating, setRotating] = useState<{ id: string; centerX: number; centerY: number; startAngle: number; startRotation: number } | null>(null);

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(Math.max(z * delta, 0.2), 5));
  }, []);

  // Pan with middle-click or ctrl+click
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (e.button === 0 && !(e.target as HTMLElement).closest("[data-table-id]")) {
      onSelectTable(null);
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        return;
      }
      if (rotating && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        const angle = Math.atan2(mouseY - rotating.centerY, mouseX - rotating.centerX) * (180 / Math.PI);
        const delta = angle - rotating.startAngle;
        let newRotation = (rotating.startRotation + delta) % 360;
        if (newRotation < 0) newRotation += 360;
        onUpdateTable(rotating.id, { rotation: Math.round(newRotation) });
        return;
      }
      if (resizing && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        const dx = mouseX - resizing.startX;
        const dy = mouseY - resizing.startY;
        const handle = resizing.handle;
        let newW = resizing.startW;
        let newH = resizing.startH;
        let newX = resizing.startPosX;
        let newY = resizing.startPosY;

        if (resizing.isRound) {
          // Uniform diameter resize for round tables
          const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
          const sign = handle.includes("w") || handle.includes("n") ? -1 : 1;
          const newSize = Math.max(20, resizing.startW + delta * sign);
          newW = newSize;
          newH = newSize;
          if (handle.includes("w") || handle.includes("nw") || handle.includes("sw")) newX = resizing.startPosX + (resizing.startW - newSize);
          if (handle.includes("n") || handle.includes("nw") || handle.includes("ne")) newY = resizing.startPosY + (resizing.startH - newSize);
        } else {
          if (handle.includes("e")) newW = Math.max(20, resizing.startW + dx);
          if (handle.includes("w")) { newW = Math.max(20, resizing.startW - dx); newX = resizing.startPosX + (resizing.startW - newW); }
          if (handle.includes("s")) newH = Math.max(20, resizing.startH + dy);
          if (handle.includes("n")) { newH = Math.max(20, resizing.startH - dy); newY = resizing.startPosY + (resizing.startH - newH); }
        }

        onUpdateTable(resizing.id, { width: newW, height: newH, x_position: newX, y_position: newY });
        return;
      }
      if (draggingId && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
        const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
        onUpdateTable(draggingId, { x_position: x, y_position: y });
      }
    },
    [isPanning, panStart, rotating, resizing, draggingId, dragOffset, zoom, pan, onUpdateTable]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingId(null);
    setResizing(null);
    setRotating(null);
  }, []);

  const startDragTable = (e: React.MouseEvent, table: VenueTable) => {
    e.stopPropagation();
    if (e.ctrlKey) return; // allow pan
    onSelectTable(table.id);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setDragOffset({ x: mouseX - table.x_position, y: mouseY - table.y_position });
      setDraggingId(table.id);
    }
  };

  const startResize = (e: React.MouseEvent, table: VenueTable, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setResizing({ id: table.id, handle, startX: mouseX, startY: mouseY, startW: table.width, startH: table.height, startPosX: table.x_position, startPosY: table.y_position, isRound: table.shape === "round" });
      onSelectTable(table.id);
    }
  };

  const startRotate = (e: React.MouseEvent, table: VenueTable) => {
    e.stopPropagation();
    e.preventDefault();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = table.x_position + table.width / 2;
      const centerY = table.y_position + table.height / 2;
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      const startAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
      setRotating({ id: table.id, centerX, centerY, startAngle, startRotation: table.rotation });
      onSelectTable(table.id);
    }
  };

  const resizeHandles = [
    { key: "n", cursor: "ns-resize", style: { top: -4, left: "50%", transform: "translateX(-50%)", width: 14, height: 8 } },
    { key: "s", cursor: "ns-resize", style: { bottom: -4, left: "50%", transform: "translateX(-50%)", width: 14, height: 8 } },
    { key: "e", cursor: "ew-resize", style: { right: -4, top: "50%", transform: "translateY(-50%)", width: 8, height: 14 } },
    { key: "w", cursor: "ew-resize", style: { left: -4, top: "50%", transform: "translateY(-50%)", width: 8, height: 14 } },
    { key: "ne", cursor: "nesw-resize", style: { top: -4, right: -4, width: 8, height: 8 } },
    { key: "nw", cursor: "nwse-resize", style: { top: -4, left: -4, width: 8, height: 8 } },
    { key: "se", cursor: "nwse-resize", style: { bottom: -4, right: -4, width: 8, height: 8 } },
    { key: "sw", cursor: "nesw-resize", style: { bottom: -4, left: -4, width: 8, height: 8 } },
  ];

  const renderTableShape = (table: VenueTable) => {
    const isSelected = table.id === selectedTableId;
    const baseClasses = `absolute transition-shadow ${
      isSelected ? "ring-2 ring-primary shadow-lg" : "hover:ring-1 hover:ring-primary/50"
    }`;

    const style: React.CSSProperties = {
      left: table.x_position,
      top: table.y_position,
      width: table.width,
      height: table.height,
      transform: `rotate(${table.rotation}deg)`,
      transformOrigin: "center center",
    };

    const borderRadius =
      table.shape === "round"
        ? "50%"
        : table.shape === "oval"
        ? "50%"
        : table.shape === "square"
        ? "8px"
        : "8px";

    const minDim = Math.min(table.width, table.height);
    const effectiveDim = (table.shape === "round" || table.shape === "oval") ? minDim * 0.7 : minDim;
    const nameFontSize = Math.max(7, Math.min(14, effectiveDim * 0.28));
    const guestFontSize = Math.max(6, Math.min(11, effectiveDim * 0.2));
    const showGuests = effectiveDim > 30;

    return (
      <div
        key={table.id}
        data-table-id={table.id}
        className={baseClasses}
        style={{ ...style, borderRadius, cursor: resizing ? "default" : "move" }}
        onMouseDown={(e) => startDragTable(e, table)}
        title={`${table.name} — ${table.guest_count} guests`}
      >
        <div
          className="w-full h-full flex flex-col items-center justify-center bg-background border-2 border-primary/40 overflow-hidden"
          style={{ borderRadius, padding: table.shape === "round" || table.shape === "oval" ? "15%" : "2px" }}
        >
          <span
            className="font-semibold text-foreground leading-none text-center break-words"
            style={{ fontSize: nameFontSize, maxWidth: "100%", wordBreak: "break-word" }}
          >
            {table.name}
          </span>
          {showGuests && (
            <span className="text-muted-foreground leading-none mt-0.5" style={{ fontSize: guestFontSize }}>
              {table.guest_count} guests
            </span>
          )}
        </div>
        {isSelected && resizeHandles
          .filter((h) => table.shape !== "round" || h.key.length === 2)
          .map((h) => (
          <div
            key={h.key}
            className="absolute bg-primary border border-primary-foreground rounded-sm z-10"
            style={{ ...h.style, cursor: h.cursor, position: "absolute" } as React.CSSProperties}
            onMouseDown={(e) => startResize(e, table, h.key)}
          />
        ))}
        {isSelected && (
          <>
            {/* Line from top center to rotation handle */}
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                left: "50%",
                top: -24,
                width: 1,
                height: 20,
                backgroundColor: "hsl(var(--primary))",
                transformOrigin: "bottom center",
              }}
            />
            {/* Rotation handle */}
            <div
              className="absolute z-10 bg-primary border-2 border-primary-foreground rounded-full"
              style={{
                left: "50%",
                top: -30,
                width: 12,
                height: 12,
                transform: "translateX(-50%)",
                cursor: "grab",
              }}
              onMouseDown={(e) => startRotate(e, table)}
              title="Drag to rotate"
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-muted/30"
      style={{ cursor: isPanning ? "grabbing" : resizing ? "default" : draggingId ? "grabbing" : "default" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-lg border border-border/30 p-1">
        <button
          className="w-7 h-7 flex items-center justify-center rounded text-sm font-medium hover:bg-muted"
          onClick={() => setZoom((z) => Math.min(z * 1.2, 5))}
        >
          +
        </button>
        <span className="text-[10px] text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button
          className="w-7 h-7 flex items-center justify-center rounded text-sm font-medium hover:bg-muted"
          onClick={() => setZoom((z) => Math.max(z * 0.8, 0.2))}
        >
          −
        </button>
      </div>

      {/* Transform layer */}
      <div
        ref={exportRef}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          position: "absolute",
          top: 0,
          left: 0,
          width: 2000,
          height: 2000,
        }}
      >
        {/* Grid */}
        {showGrid && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        )}

        {/* Plan image — scaled to ~1000px wide so tables look proportional */}
        {planImageUrl && (
          <img
            src={planImageUrl}
            alt="Venue plan"
            className="absolute top-0 left-0 max-w-none opacity-50 pointer-events-none"
            style={{ width: 1000, height: "auto" }}
            loading="lazy"
          />
        )}

        {/* Tables */}
        {tables.map(renderTableShape)}
      </div>

      {/* Empty state */}
      {tables.length === 0 && !planImageUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Upload a venue plan or start adding tables</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Use the toolbar on the left</p>
          </div>
        </div>
      )}
    </div>
  );
};
