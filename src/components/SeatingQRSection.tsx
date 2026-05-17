import { useRef, useState } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, QrCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SeatingQRSectionProps {
  weddingSlug: string;
}

export default function SeatingQRSection({ weddingSlug }: SeatingQRSectionProps) {
  const url = `https://aureainvites.com/seating/${weddingSlug}`;
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  };

  const downloadPng = () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;
    // Add white padding by drawing onto a larger canvas
    const padded = document.createElement("canvas");
    const size = canvas.width;
    const pad = Math.round(size * 0.1);
    padded.width = size + pad * 2;
    padded.height = size + pad * 2;
    const ctx = padded.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, padded.width, padded.height);
    ctx.drawImage(canvas, pad, pad);
    const a = document.createElement("a");
    a.href = padded.toDataURL("image/png");
    a.download = `seating-qr-${weddingSlug}.png`;
    a.click();
  };

  const downloadSvg = () => {
    const svg = svgWrapRef.current?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const serialized = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([serialized], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `seating-qr-${weddingSlug}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mt-6 pt-6 border-t">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          Seating QR
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Generate a QR code that guests can scan at the venue to find their table. Print it on a sign
        and place it at the entrance.
      </p>

      <div className="flex flex-col items-center gap-4">
        <div
          ref={svgWrapRef}
          className="p-4 bg-white rounded-lg border border-border"
        >
          <QRCodeSVG value={url} size={240} level="H" includeMargin={false} />
        </div>

        <div className="w-full flex items-center gap-2 max-w-md">
          <code className="flex-1 text-[11px] sm:text-xs font-mono px-3 py-2 rounded-md bg-muted/50 border truncate">
            {url}
          </code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="rounded-md h-9 px-3 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="ml-1.5 hidden sm:inline">Copy link</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={downloadPng} size="sm" className="rounded-full text-xs h-8 px-4">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download QR Code
          </Button>
          <Button
            onClick={downloadSvg}
            variant="outline"
            size="sm"
            className="rounded-full text-xs h-8 px-4"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download SVG
          </Button>
        </div>
      </div>

      {/* Hidden high-res canvas for PNG export */}
      <div style={{ position: "absolute", left: -99999, top: -99999 }} aria-hidden>
        <QRCodeCanvas
          ref={hiddenCanvasRef}
          value={url}
          size={1024}
          level="H"
          includeMargin={false}
        />
      </div>
    </div>
  );
}
