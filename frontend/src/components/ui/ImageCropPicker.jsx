import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const CANVAS_SIZE = 300;
const RADIUS = 128;

/**
 * ImageCropPicker — modal overlay via portal (no empuja el layout)
 *
 * Props:
 *   open            — boolean
 *   onClose()       — callback al cancelar / click fuera
 *   onCrop(dataUrl) — callback con PNG base64 del recorte
 *   outputSize?     — px del canvas de salida (default: 400)
 *   maxFileMB?      — límite en MB (default: 5)
 *   accept?         — MIME types (default: "image/png,image/jpeg")
 *   shape?          — "circle" | "square" (default: "square")
 */
export default function ImageCropPicker({
  open,
  onClose,
  onCrop,
  outputSize = 400,
  maxFileMB = 5,
  accept = "image/png,image/jpeg",
  shape = "square",
}) {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const [img, setImg] = useState(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("upload");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (open) {
      setImg(null); setZoom(1); setOffset({ x: 0, y: 0 });
      setError(""); setPhase("upload"); setDragOver(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [open]);

  // Bloquea scroll del body mientras el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const clampOffset = useCallback((ox, oy, z, w, h) => {
    const minSide = Math.min(w, h);
    const visible = minSide / z;
    const halfX = Math.max(0, (w - visible) / 2);
    const halfY = Math.max(0, (h - visible) / 2);
    return {
      x: Math.max(-halfX, Math.min(halfX, ox)),
      y: Math.max(-halfY, Math.min(halfY, oy)),
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    const { w: imgW, h: imgH } = imgSize;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const scale = CANVAS_SIZE / (Math.min(imgW, imgH) / zoom);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const sx = (CANVAS_SIZE - drawW) / 2 - offset.x * scale;
    const sy = (CANVAS_SIZE - drawH) / 2 - offset.y * scale;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.beginPath();
    if (shape === "circle") ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
    else ctx.roundRect(cx - RADIUS, cy - RADIUS, RADIUS * 2, RADIUS * 2, 10);
    ctx.clip();
    ctx.drawImage(img, sx, sy, drawW, drawH);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    if (shape === "circle") ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
    else ctx.roundRect(cx - RADIUS, cy - RADIUS, RADIUS * 2, RADIUS * 2, 10);
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    if (shape === "circle") ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
    else ctx.roundRect(cx - RADIUS, cy - RADIUS, RADIUS * 2, RADIUS * 2, 10);
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 2; i++) {
      const x = cx - RADIUS + (RADIUS * 2 / 3) * i;
      const y = cy - RADIUS + (RADIUS * 2 / 3) * i;
      ctx.beginPath();
      ctx.moveTo(x, cy - RADIUS); ctx.lineTo(x, cy + RADIUS);
      ctx.moveTo(cx - RADIUS, y); ctx.lineTo(cx + RADIUS, y);
      ctx.stroke();
    }
    ctx.restore();
  }, [img, imgSize, zoom, offset, shape]);

  useEffect(() => { draw(); }, [draw]);

  const loadFile = (file) => {
    if (!file) return;
    const types = accept.split(",").map((t) => t.trim());
    if (!types.includes(file.type)) {
      setError("Formato no soportado. Acepta: " + accept);
      return;
    }
    if (file.size > maxFileMB * 1024 * 1024) {
      setError(`El archivo supera el límite de ${maxFileMB} MB`);
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const i = new Image();
      i.onload = () => {
        setImg(i);
        setImgSize({ w: i.width, h: i.height });
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setPhase("crop");
      };
      i.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const getPos = (e) =>
    e.touches
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };

  const onPointerDown = (e) => { setDragging(true); setLastPos(getPos(e)); };
  const onPointerUp = () => setDragging(false);

  const onPointerMove = useCallback((e) => {
    if (!dragging || !img) return;
    const pos = getPos(e);
    const dx = pos.x - lastPos.x;
    const dy = pos.y - lastPos.y;
    setLastPos(pos);
    const scale = CANVAS_SIZE / (Math.min(imgSize.w, imgSize.h) / zoom);
    setOffset((prev) => {
      const nx = prev.x - dx / scale;
      const ny = prev.y - dy / scale;
      return clampOffset(nx, ny, zoom, imgSize.w, imgSize.h);
    });
  }, [dragging, img, imgSize, zoom, lastPos, clampOffset]);

  useEffect(() => {
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
    return () => {
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
    };
  }, [onPointerMove]);

  const handleZoom = (e) => {
    const z = parseInt(e.target.value) / 100;
    setZoom(z);
    setOffset((prev) => clampOffset(prev.x, prev.y, z, imgSize.w, imgSize.h));
  };

  const handleApply = () => {
    const out = document.createElement("canvas");
    out.width = outputSize;
    out.height = outputSize;
    const oc = out.getContext("2d");
    const { w: imgW, h: imgH } = imgSize;
    const scale = CANVAS_SIZE / (Math.min(imgW, imgH) / zoom);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const sx = (CANVAS_SIZE - drawW) / 2 - offset.x * scale;
    const sy = (CANVAS_SIZE - drawH) / 2 - offset.y * scale;

    oc.drawImage(
      img,
      sx + (cx - RADIUS), sy + (cy - RADIUS),
      RADIUS * 2, RADIUS * 2,
      0, 0, outputSize, outputSize
    );
    onCrop(out.toDataURL("image/png"));
  };

  if (!open) return null;

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeIn .15s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } } @keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }`}</style>
      <div
        style={{
          background: "#1c1c1e",
          borderRadius: 20,
          padding: "28px 24px 24px",
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          animation: "slideUp .2s ease",
        }}
      >
        {/* Header */}
        <div style={{ alignSelf: "stretch" }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
            {phase === "upload" ? "Subir logo" : "Ajusta tu logo"}
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
            {phase === "upload"
              ? `PNG, JPG · Máximo ${maxFileMB} MB`
              : "Arrastra para mover · Zoom con el slider"}
          </p>
        </div>

        {/* ── Upload ── */}
        {phase === "upload" && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              onChange={(e) => loadFile(e.target.files[0])}
              style={{ display: "none" }}
            />
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); loadFile(e.dataTransfer.files[0]); }}
              style={{
                width: "100%", borderRadius: 14, cursor: "pointer",
                border: `1.5px dashed ${dragOver ? "rgba(255,107,107,.8)" : "rgba(255,255,255,.18)"}`,
                background: dragOver ? "rgba(255,107,107,.06)" : "rgba(255,255,255,.03)",
                padding: "40px 20px", textAlign: "center",
                transition: "border-color .2s, background .2s",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.85)", marginBottom: 6 }}>
                Arrastra tu logo aquí
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>
                o{" "}
                <span style={{ color: "#FF6B6B", fontWeight: 600 }}>
                  haz clic para subir
                </span>
              </p>
            </div>
            {error && (
              <p style={{ fontSize: 12, color: "#e24b4a", alignSelf: "flex-start", marginTop: -8 }}>
                {error}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", width: "100%" }}>
              <button onClick={onClose} style={s.ghost}>Cancelar</button>
            </div>
          </>
        )}

        {/* ── Crop ── */}
        {phase === "crop" && (
          <>
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              style={{
                borderRadius: 12,
                cursor: dragging ? "grabbing" : "grab",
                touchAction: "none",
                width: "100%",
                maxWidth: CANVAS_SIZE,
              }}
              onMouseDown={onPointerDown}
              onTouchStart={onPointerDown}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 15 }}>−</span>
              <input
                type="range" min={100} max={300} step={1}
                value={Math.round(zoom * 100)}
                onChange={handleZoom}
                style={{ flex: 1, accentColor: "#FF6B6B" }}
              />
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 15 }}>+</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)", minWidth: 34 }}>
                {zoom.toFixed(1)}×
              </span>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", width: "100%" }}>
              <button onClick={onClose} style={s.ghost}>Cancelar</button>
              <button onClick={handleApply} style={s.primary}>Aplicar</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

const s = {
  ghost: {
    background: "transparent",
    border: "0.5px solid rgba(255,255,255,.22)",
    color: "rgba(255,255,255,.65)",
    fontSize: 13, padding: "8px 20px",
    borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
  },
  primary: {
    background: "#FF6B6B", border: "none",
    color: "#fff", fontSize: 13, fontWeight: 600,
    padding: "8px 20px", borderRadius: 8,
    cursor: "pointer", fontFamily: "inherit",
  },
};