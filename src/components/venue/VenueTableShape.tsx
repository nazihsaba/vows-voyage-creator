import React, { useRef, useEffect } from "react";
import { Group, Rect, Circle, Ellipse, Text, Transformer } from "react-konva";
import type { VenueTable } from "@/hooks/useVenueProject";
import Konva from "konva";

interface VenueTableShapeProps {
  table: VenueTable;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<VenueTable>) => void;
}

const VenueTableShape: React.FC<VenueTableShapeProps> = ({
  table,
  isSelected,
  onSelect,
  onChange,
}) => {
  const shapeRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      x_position: e.target.x(),
      y_position: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x_position: node.x(),
      y_position: node.y(),
      width: Math.max(30, table.width * scaleX),
      height: Math.max(30, table.height * scaleY),
      rotation: node.rotation(),
    });
  };

  const renderShape = () => {
    const fill = isSelected ? "#e0d4f5" : "#d4c5a9";
    const stroke = isSelected ? "#8b5cf6" : "#a89070";

    switch (table.shape) {
      case "round":
        return (
          <Circle
            radius={table.width / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
          />
        );
      case "oval":
        return (
          <Ellipse
            radiusX={table.width / 2}
            radiusY={table.height / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
          />
        );
      case "square":
        return (
          <Rect
            width={table.width}
            height={table.width}
            offsetX={table.width / 2}
            offsetY={table.width / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
            cornerRadius={4}
          />
        );
      case "rectangle":
      default:
        return (
          <Rect
            width={table.width}
            height={table.height}
            offsetX={table.width / 2}
            offsetY={table.height / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
            cornerRadius={4}
          />
        );
    }
  };

  const labelText = table.name || "Table";

  return (
    <>
      <Group
        ref={shapeRef}
        x={table.x_position}
        y={table.y_position}
        rotation={table.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {renderShape()}
        <Text
          text={labelText}
          fontSize={12}
          fill="#1a1a1a"
          align="center"
          verticalAlign="middle"
          width={table.width}
          height={20}
          offsetX={table.width / 2}
          offsetY={10}
        />
        {table.guest_count > 0 && (
          <Text
            text={`👤 ${table.guest_count}`}
            fontSize={10}
            fill="#666"
            align="center"
            width={table.width}
            offsetX={table.width / 2}
            y={12}
          />
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 30 || newBox.height < 30) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default VenueTableShape;
