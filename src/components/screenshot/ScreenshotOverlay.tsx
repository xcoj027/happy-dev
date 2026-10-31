/**
 * HappyDev - Standalone Native Screenshot Overlay
 *
 * Professional screen capture & snip tool (Lightshot / CleanShot / Snipaste style)
 * Runs fullscreen in an independent transparent window.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import {
  Square,
  ArrowUpRight,
  Pencil,
  Type,
  EyeOff,
  Highlighter,
  Undo2,
  Redo2,
  Check,
  Download,
  ExternalLink,
  X,
  Copy,
  Maximize2
} from 'lucide-react';
import {
  CapturedScreenData,
  getLatestScreenshot,
  closeScreenshotOverlay,
  copyImageToClipboard,
  saveScreenshotToFile,
  sendScreenshotToMainEditor,
} from '../../lib/desktop';

type Tool = 'select' | 'rect' | 'arrow' | 'pen' | 'text' | 'blur' | 'highlighter';

interface Annotation {
  id: string;
  tool: Tool;
  color: string;
  width: number;
  // For rect, arrow, blur, highlighter
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  // For pen
  points?: { x: number; y: number }[];
  // For text
  text?: string;
  fontSize?: number;
}

const COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Yellow', hex: '#f59e0b' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#000000' },
];

export const ScreenshotOverlay: React.FC = () => {
  const [screenData, setScreenData] = useState<CapturedScreenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selection bounds in logical CSS pixels
  const [selection, setSelection] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Tools & Styling
  const [activeTool, setActiveTool] = useState<Tool>('rect');
  const [activeColor, setActiveColor] = useState<string>('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  // Annotations history
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);

  // In-progress annotation
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);

  // Inline text editing
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>('');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load screenshot on mount or listen to event
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const init = async () => {
      try {
        const data = await getLatestScreenshot();
        setScreenData(data);
        setLoading(false);
      } catch {
        // Wait for event if getLatestScreenshot is not immediately ready
      }

      unlisten = await listen<CapturedScreenData>('screenshot-captured', (event) => {
        setScreenData(event.payload);
        setSelection(null);
        setAnnotations([]);
        setUndoStack([]);
        setRedoStack([]);
        setLoading(false);
      });
    };

    init();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  // Preload background image object
  useEffect(() => {
    if (!screenData?.data_url) return;
    const img = new Image();
    img.src = screenData.data_url;
    img.onload = () => {
      bgImageRef.current = img;
      renderCanvas();
    };
  }, [screenData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Render canvas layers
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 1. Draw desktop capture
    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, width, height);
    }

    // 2. Draw dim overlay around selection
    if (selection && selection.width > 0 && selection.height > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      // Top
      ctx.fillRect(0, 0, width, selection.y);
      // Bottom
      ctx.fillRect(0, selection.y + selection.height, width, height - (selection.y + selection.height));
      // Left
      ctx.fillRect(0, selection.y, selection.x, selection.height);
      // Right
      ctx.fillRect(
        selection.x + selection.width,
        selection.y,
        width - (selection.x + selection.width),
        selection.height
      );

      // Border outline around selection
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
      ctx.setLineDash([]);
    } else {
      // Dim entire screen before selection is made
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Draw annotations
    const allAnnotations = [...annotations, ...(currentAnnotation ? [currentAnnotation] : [])];

    // Clip to selection if selection exists
    if (selection && selection.width > 0 && selection.height > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(selection.x, selection.y, selection.width, selection.height);
      ctx.clip();
    }

    for (const ann of allAnnotations) {
      ctx.save();
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = ann.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (ann.tool === 'rect') {
        const x = Math.min(ann.startX, ann.endX ?? ann.startX);
        const y = Math.min(ann.startY, ann.endY ?? ann.startY);
        const w = Math.abs((ann.endX ?? ann.startX) - ann.startX);
        const h = Math.abs((ann.endY ?? ann.startY) - ann.startY);
        ctx.strokeRect(x, y, w, h);
      } else if (ann.tool === 'arrow') {
        const fromX = ann.startX;
        const fromY = ann.startY;
        const toX = ann.endX ?? fromX;
        const toY = ann.endY ?? fromY;
        const headLen = Math.max(12, ann.width * 3.5);
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (ann.tool === 'pen' && ann.points && ann.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.stroke();
      } else if (ann.tool === 'highlighter' && ann.points && ann.points.length > 1) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = Math.max(16, ann.width * 4);
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      } else if (ann.tool === 'blur') {
        // Redact / Blur area
        const x = Math.min(ann.startX, ann.endX ?? ann.startX);
        const y = Math.min(ann.startY, ann.endY ?? ann.startY);
        const w = Math.abs((ann.endX ?? ann.startX) - ann.startX);
        const h = Math.abs((ann.endY ?? ann.startY) - ann.startY);
        if (w > 2 && h > 2) {
          ctx.save();
          // Create pixelated or frosted mosaic
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);
          ctx.restore();
        }
      } else if (ann.tool === 'text' && ann.text) {
        ctx.font = `bold ${ann.fontSize || 18}px system-ui, -apple-system, sans-serif`;
        // Text shadow for readability
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(ann.text, ann.startX, ann.startY);
      }

      ctx.restore();
    }

    if (selection) {
      ctx.restore();
    }

    ctx.restore();
  }, [selection, annotations, currentAnnotation]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => renderCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  // Select entire screen
  const selectFullScreen = () => {
    setSelection({
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeScreenshotOverlay(true);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleCopy();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, annotations]);

  // Mouse handlers for selection & drawing
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!selection) {
      // Starting initial crop selection
      setIsDraggingSelection(true);
      dragStartRef.current = { x, y };
      setSelection({ x, y, width: 0, height: 0 });
    } else {
      // Selection exists: if click inside selection, draw with active tool
      const inSelection =
        x >= selection.x &&
        x <= selection.x + selection.width &&
        y >= selection.y &&
        y <= selection.y + selection.height;

      if (!inSelection) {
        // Clicked outside: re-select new region
        setIsDraggingSelection(true);
        dragStartRef.current = { x, y };
        setSelection({ x, y, width: 0, height: 0 });
        setAnnotations([]);
        return;
      }

      // Drawing within selection
      if (activeTool === 'text') {
        setTextInputPos({ x, y });
        setTextInputValue('');
        return;
      }

      const id = `${Date.now()}-${Math.random()}`;
      if (activeTool === 'pen' || activeTool === 'highlighter') {
        setCurrentAnnotation({
          id,
          tool: activeTool,
          color: activeColor,
          width: strokeWidth,
          startX: x,
          startY: y,
          points: [{ x, y }],
        });
      } else {
        setCurrentAnnotation({
          id,
          tool: activeTool,
          color: activeColor,
          width: strokeWidth,
          startX: x,
          startY: y,
          endX: x,
          endY: y,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingSelection && dragStartRef.current) {
      const sx = dragStartRef.current.x;
      const sy = dragStartRef.current.y;
      const newX = Math.min(sx, x);
      const newY = Math.min(sy, y);
      const newW = Math.abs(x - sx);
      const newH = Math.abs(y - sy);
      setSelection({ x: newX, y: newY, width: newW, height: newH });
    } else if (currentAnnotation) {
      if (currentAnnotation.tool === 'pen' || currentAnnotation.tool === 'highlighter') {
        setCurrentAnnotation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            points: [...(prev.points || []), { x, y }],
          };
        });
      } else {
        setCurrentAnnotation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            endX: x,
            endY: y,
          };
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDraggingSelection) {
      setIsDraggingSelection(false);
      dragStartRef.current = null;
      // If user just clicked without dragging, default to full screen
      if (selection && selection.width < 10 && selection.height < 10) {
        setSelection(null);
      }
    } else if (currentAnnotation) {
      setUndoStack((prev) => [...prev, annotations]);
      setRedoStack([]);
      setAnnotations((prev) => [...prev, currentAnnotation]);
      setCurrentAnnotation(null);
    }
  };

  const handleFinishText = () => {
    if (textInputPos && textInputValue.trim()) {
      setUndoStack((prev) => [...prev, annotations]);
      setRedoStack([]);
      setAnnotations((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          tool: 'text',
          color: activeColor,
          width: 2,
          startX: textInputPos.x,
          startY: textInputPos.y + 16,
          text: textInputValue.trim(),
          fontSize: 18,
        },
      ]);
    }
    setTextInputPos(null);
    setTextInputValue('');
  };

  const handleUndo = () => {
    if (annotations.length === 0) return;
    const last = annotations[annotations.length - 1];
    setRedoStack((prev) => [...prev, [last]]);
    setAnnotations((prev) => prev.slice(0, prev.length - 1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const restore = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setAnnotations((prev) => [...prev, ...restore]);
  };

  // Generate cropped and annotated image as high-res Base64 PNG
  const getRenderedCropDataUrl = (): string | null => {
    if (!bgImageRef.current) return null;
    const img = bgImageRef.current;

    // Logical dimensions vs natural image dimensions
    const scaleX = img.naturalWidth / window.innerWidth;
    const scaleY = img.naturalHeight / window.innerHeight;

    const crop = selection && selection.width > 10 && selection.height > 10
      ? selection
      : { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };

    const cropNaturalX = Math.round(crop.x * scaleX);
    const cropNaturalY = Math.round(crop.y * scaleY);
    const cropNaturalW = Math.round(crop.width * scaleX);
    const cropNaturalH = Math.round(crop.height * scaleY);

    const offscreen = document.createElement('canvas');
    offscreen.width = cropNaturalW;
    offscreen.height = cropNaturalH;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    // 1. Draw cropped background
    ctx.drawImage(
      img,
      cropNaturalX,
      cropNaturalY,
      cropNaturalW,
      cropNaturalH,
      0,
      0,
      cropNaturalW,
      cropNaturalH
    );

    // 2. Draw annotations scaled to natural crop coordinates
    ctx.save();
    ctx.translate(-cropNaturalX, -cropNaturalY);
    ctx.scale(scaleX, scaleY);

    for (const ann of annotations) {
      ctx.save();
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = ann.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (ann.tool === 'rect') {
        const x = Math.min(ann.startX, ann.endX ?? ann.startX);
        const y = Math.min(ann.startY, ann.endY ?? ann.startY);
        const w = Math.abs((ann.endX ?? ann.startX) - ann.startX);
        const h = Math.abs((ann.endY ?? ann.startY) - ann.startY);
        ctx.strokeRect(x, y, w, h);
      } else if (ann.tool === 'arrow') {
        const fromX = ann.startX;
        const fromY = ann.startY;
        const toX = ann.endX ?? fromX;
        const toY = ann.endY ?? fromY;
        const headLen = Math.max(14, ann.width * 3.5);
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (ann.tool === 'pen' && ann.points && ann.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.stroke();
      } else if (ann.tool === 'highlighter' && ann.points && ann.points.length > 1) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = Math.max(16, ann.width * 4);
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      } else if (ann.tool === 'blur') {
        const x = Math.min(ann.startX, ann.endX ?? ann.startX);
        const y = Math.min(ann.startY, ann.endY ?? ann.startY);
        const w = Math.abs((ann.endX ?? ann.startX) - ann.startX);
        const h = Math.abs((ann.endY ?? ann.startY) - ann.startY);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(x, y, w, h);
      } else if (ann.tool === 'text' && ann.text) {
        ctx.font = `bold ${ann.fontSize || 18}px system-ui, -apple-system, sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(ann.text, ann.startX, ann.startY);
      }

      ctx.restore();
    }

    ctx.restore();
    return offscreen.toDataURL('image/png');
  };

  // Actions
  const handleCopy = async () => {
    const dataUrl = getRenderedCropDataUrl();
    if (!dataUrl) return;

    try {
      await copyImageToClipboard(dataUrl);
      showToast('Đã sao chép ảnh chụp vào Clipboard!');
      setTimeout(() => {
        closeScreenshotOverlay(true);
      }, 400);
    } catch (e: any) {
      showToast(`Lỗi sao chép: ${e?.message || e}`);
    }
  };

  const handleSave = async () => {
    const dataUrl = getRenderedCropDataUrl();
    if (!dataUrl) return;

    try {
      const savedPath = await saveScreenshotToFile(dataUrl);
      showToast(`Đã lưu ảnh vào Downloads: ${savedPath}`);
      setTimeout(() => {
        closeScreenshotOverlay(true);
      }, 1000);
    } catch (e: any) {
      showToast(`Lỗi lưu ảnh: ${e?.message || e}`);
    }
  };

  const handleOpenInEditor = async () => {
    const dataUrl = getRenderedCropDataUrl();
    if (!dataUrl) return;

    try {
      await sendScreenshotToMainEditor(dataUrl);
    } catch (e: any) {
      showToast(`Lỗi gửi ảnh sang HappyDev: ${e?.message || e}`);
    }
  };

  // Calculate toolbar position
  const getToolbarStyle = (): React.CSSProperties => {
    if (!selection) return { display: 'none' };

    const toolbarHeight = 48;
    const margin = 10;
    let top = selection.y + selection.height + margin;

    // If toolbar overflows bottom of viewport, position it above selection
    if (top + toolbarHeight > window.innerHeight - 20) {
      top = Math.max(10, selection.y - toolbarHeight - margin);
    }

    // Horizontal center alignment with selection
    let left = selection.x + selection.width / 2;

    return {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      transform: 'translateX(-50%)',
      zIndex: 50,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden select-none cursor-crosshair font-sans"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={selectFullScreen}
    >
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Top Banner Hint */}
      {!selection && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-slate-900/90 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center gap-3 text-sm z-40 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <span>Kéo chuột để chọn vùng chụp</span>
          <span className="text-slate-400">•</span>
          <span>Nhấp đúp: Toàn màn hình</span>
          <span className="text-slate-400">•</span>
          <span className="text-amber-300 font-mono text-xs">Esc: Thoát</span>
        </div>
      )}

      {/* Dimension Tag */}
      {selection && selection.width > 0 && selection.height > 0 && (
        <div
          className="absolute px-2.5 py-1 rounded bg-slate-900/90 text-sky-300 border border-slate-700/80 font-mono text-xs shadow-lg backdrop-blur pointer-events-none z-40"
          style={{
            top: `${Math.max(8, selection.y - 28)}px`,
            left: `${selection.x}px`,
          }}
        >
          {Math.round(selection.width)} × {Math.round(selection.height)} px
        </div>
      )}

      {/* Inline Text Input Box */}
      {textInputPos && (
        <div
          className="absolute z-50"
          style={{ top: `${textInputPos.y}px`, left: `${textInputPos.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            autoFocus
            type="text"
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFinishText();
              if (e.key === 'Escape') setTextInputPos(null);
            }}
            onBlur={handleFinishText}
            placeholder="Nhập chú thích..."
            style={{ color: activeColor }}
            className="px-2 py-1 bg-slate-950/90 border border-sky-400 rounded text-base font-bold shadow-xl outline-none min-w-[140px]"
          />
        </div>
      )}

      {/* Floating Action Toolbar */}
      {selection && selection.width > 20 && selection.height > 20 && (
        <div
          style={getToolbarStyle()}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/95 text-slate-200 border border-slate-700/90 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Annotation Tools */}
          <div className="flex items-center gap-1 border-r border-slate-700/80 pr-2 mr-1">
            <button
              title="Vẽ hình chữ nhật"
              onClick={() => setActiveTool('rect')}
              className={`p-1.5 rounded-lg transition-colors ${
                activeTool === 'rect' ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              title="Vẽ mũi tên chỉ dẫn"
              onClick={() => setActiveTool('arrow')}
              className={`p-1.5 rounded-lg transition-colors ${
                activeTool === 'arrow' ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              title="Bút vẽ tự do"
              onClick={() => setActiveTool('pen')}
              className={`p-1.5 rounded-lg transition-colors ${
                activeTool === 'pen' ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              title="Viết chữ"
              onClick={() => setActiveTool('text')}
              className={`p-1.5 rounded-lg transition-colors ${
                activeTool === 'text' ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              title="Bút dạ quang (Highlighter)"
              onClick={() => setActiveTool('highlighter')}
              className={`p-1.5 rounded-lg transition-colors ${
                activeTool === 'highlighter' ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Highlighter className="w-4 h-4" />
            </button>
            <button
              title="Làm mờ / Che thông tin nhạy cảm"
              onClick={() => setActiveTool('blur')}
              className={`p-1.5 rounded-lg transition-colors ${
                activeTool === 'blur' ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1.5 border-r border-slate-700/80 pr-2 mr-1">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                title={c.name}
                onClick={() => setActiveColor(c.hex)}
                className={`w-4 h-4 rounded-full transition-transform ${
                  activeColor === c.hex ? 'scale-125 ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-900' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border-r border-slate-700/80 pr-2 mr-1">
            <button
              title="Hoàn tác (Cmd/Ctrl+Z)"
              disabled={annotations.length === 0}
              onClick={handleUndo}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              title="Làm lại (Cmd/Ctrl+Shift+Z)"
              disabled={redoStack.length === 0}
              onClick={handleRedo}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary Actions */}
          <button
            title="Chỉnh sửa nâng cao trong HappyDev"
            onClick={handleOpenInEditor}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>Mở Editor</span>
          </button>

          <button
            title="Lưu file ảnh PNG (Cmd/Ctrl+S)"
            onClick={handleSave}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Lưu file</span>
          </button>

          {/* Primary Action: Copy to Clipboard */}
          <button
            title="Sao chép vào Clipboard (Enter)"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Sao chép</span>
          </button>

          {/* Cancel */}
          <button
            title="Huỷ bỏ (Esc)"
            onClick={() => closeScreenshotOverlay(true)}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors ml-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl bg-slate-900/95 text-emerald-400 border border-emerald-500/40 shadow-2xl text-sm font-medium backdrop-blur-md flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
