import React, { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Line, Image as KonvaImage } from "react-konva";
import VenueTableShape from "./VenueTableShape";
import type { VenueTable } from "@/hooks/useVenueProject";
import Konva from "konva";

interface VenueCanvasProps {
  tables: VenueTable[];
  selectedId: string | null;
  onSelectTable: (id: string | null) => void;
  onUpdateTable: (id: string, updates: Partial<VenueTable>) => void;
  planImageUrl: string | null;
  showGrid: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const VenueCanvas: React.FC<VenueCanvasProps> = ({
  tables,
  selectedId,
  onSelectTable,
  onUpdateTable,
  planImageUrl,
  showGrid,
  zoom,
  onZoomChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setStageSize({ width, height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Load background image
  useEffect(() => {
    if (!planImageUrl) {
      setBgImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = planImageUrl;
    img.onload = () => setBgImage(img);
  }, [planImageUrl]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.08;
    const newZoom = e.evt.deltaY > 0 ? zoom / scaleBy : zoom * scaleBy;
    const clamped = Math.min(Math.max(newZoom, 0.1), 5);
    onZoomChange(clamped);

    // Adjust position to zoom towards pointer
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / zoom,
      y: (pointer.y - stagePos.y) / zoom,
    };
    setStagePos({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    });
  }, [zoom, stagePos, onZoomChange]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      onSelectTable(null);
    }
  };

  // Grid lines
  const gridLines = [];
  if (showGrid) {
    const gridSize = 50;
    const w = stageSize.width / zoom + Math.abs(stagePos.x / zoom);
    const h = stageSize.height / zoom + Math.abs(stagePos.y / zoom);
    for (let i = 0; i < w / gridSize + 1; i++) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, h]}
          stroke="#e5e5e5"
          strokeWidth={0.5}
        />
      );
    }
    for (let i = 0; i < h / gridSize + 1; i++) {
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, w, i * gridSize]}
          stroke="#e5e5e5"
          strokeWidth={0.5}
        />
      );
    }
  }

  return (
    <div ref={containerRef} className="flex-1 bg-muted/10 overflow-hidden relative">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePos.x}
        y={stagePos.y}
        draggable
        onDragEnd={(e) => {
          setStagePos({ x: e.target.x(), y: e.target.y() });
        }}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={(e) => { if (e.target === e.target.getStage()) onSelectTable(null); }}
      >
        {/* Background layer */}
        <Layer>
          {bgImage && (
            <KonvaImage
              image={bgImage}
              width={bgImage.width}
              height={bgImage.height}
              listening={false}
            />
          )}
          {gridLines}
        </Layer>

        {/* Tables layer */}
        <Layer>
          {tables.map((table) => (
            <VenueTableShape
              key={table.id}
              table={table}
              isSelected={selectedId === table.id}
              onSelect={() => onSelectTable(table.id)}
              onChange={(updates) => onUpdateTable(table.id, updates)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default VenueCanvas;
