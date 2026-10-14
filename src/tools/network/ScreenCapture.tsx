/**
 * HappyDev - Offline Developer Utilities Suite
 *
 * @author   TNQSW
 * @license  MIT (with Trademark Retention Notice)
 * @repo     https://github.com/xcoj027/happy-dev
 *
 * Copyright (c) 2026 TNQSW. All rights reserved.
 *
 * Trademark Notice:
 * Any derivative work, fork, modification, or redistribution of this software
 * must retain the original "TNQ" trademark, author credits, and notices of TNQSW.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Monitor,
  Crop,
  Upload,
  Clipboard,
  Pencil,
  ArrowUpRight,
  Square,
  EyeOff,
  Type,
  Highlighter,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  Clock,
  RotateCcw,
  X,
  Crosshair,
  Camera,
} from 'lucide-react';

type ToolMode = 'draw' | 'highlighter' | 'arrow' | 'rect' | 'blur' | 'text' | 'crop';

interface Point {
  x: number;
  y: number;
}

interface DrawShape {
  id: string;
  type: 'draw' | 'highlighter';
  points: Point[];
  color: string;
  width: number;
}

interface ArrowShape {
  id: string;
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}

interface RectShape {
  id: string;
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  widthBorder: number;
}

interface BlurShape {
  id: string;
  type: 'blur';
  x: number;
  y: number;
  width: number;
  height: number;
  blockSize: number;
}

interface TextShape {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  hasBg: boolean;
}

type Annotation = DrawShape | ArrowShape | RectShape | BlurShape | TextShape;

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HistoryState {
  annotations: Annotation[];
  baseImageDataUrl: string;
}

const COLOR_PRESETS = [
  { label: 'Red', hex: '#ef4444' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Green', hex: '#10b981' },
  { label: 'Blue', hex: '#0284c7' },
  { label: 'Purple', hex: '#8b5cf6' },
  { label: 'Pink', hex: '#ec4899' },
  { label: 'White', hex: '#ffffff' },
  { label: 'Black', hex: '#0f172a' },
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Normal', value: 4 },
  { label: 'Bold', value: 8 },
  { label: 'Heavy', value: 16 },
];

const FONT_SIZES = [
  { label: 'Small', value: 16 },
  { label: 'Medium', value: 24 },
  { label: 'Large', value: 36 },
  { label: 'Huge', value: 48 },
];

// Lightweight audio cue for countdown ticks using native Web Audio API (0 dependencies)
const playCountdownBeep = (freq = 800) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch {}
};

export const ScreenCapture: React.FC = () => {
  // Main state
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [baseImageDataUrl, setBaseImageDataUrl] = useState<string>('');
  const [tool, setTool] = useState<ToolMode>('draw');
  const [color, setColor] = useState<string>('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [fontSize, setFontSize] = useState<number>(24);
  const [textWithBg, setTextWithBg] = useState<boolean>(true);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // History stacks for Undo / Redo
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);

  // Crop mode state
  const [cropBox, setCropBox] = useState<CropRect | null>(null);
  const [cropDragMode, setCropDragMode] = useState<string | null>(null);
  const [cropStartPos, setCropStartPos] = useState<Point>({ x: 0, y: 0 });

  // Area Snipping Mode (Chụp 1 vùng nhỏ trực tiếp từ màn hình)
  const [snippingFrame, setSnippingFrame] = useState<HTMLImageElement | null>(null);
  const [snippingSelection, setSnippingSelection] = useState<CropRect | null>(null);
  const [isSnippingDrag, setIsSnippingDrag] = useState<boolean>(false);
  const [snipStartPos, setSnipStartPos] = useState<Point>({ x: 0, y: 0 });

  // Text placement state
  const [textInput, setTextInput] = useState<{ x: number; y: number; text: string } | null>(null);

  // Zoom & display
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');

  // Countdown & Capture
  const [delaySeconds, setDelaySeconds] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownTarget, setCountdownTarget] = useState<'area' | 'full' | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUnsupportedModal, setShowUnsupportedModal] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  const isDisplayMediaSupported = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');

  // Drawing in progress
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const activeShapeRef = useRef<Annotation | null>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snippingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);

  // Focus inline text input when activated
  useEffect(() => {
    if (textInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [textInput]);

  // Push current state to undo history before performing an action
  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((prev) => [
      ...prev.slice(-30),
      {
        annotations: JSON.parse(JSON.stringify(annotations)),
        baseImageDataUrl,
      },
    ]);
    setRedoStack([]);
  }, [annotations, baseImageDataUrl]);

  // Load image helper
  const loadImageFromDataUrl = useCallback(
    (dataUrl: string, addToHistory = true) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (addToHistory && baseImageDataUrl) {
          pushUndoSnapshot();
        }
        setBaseImage(img);
        setBaseImageDataUrl(dataUrl);
        setAnnotations([]);
        setCropBox(null);
        setTextInput(null);
        setErrorMessage(null);
      };
      img.onerror = () => {
        setErrorMessage('Failed to decode image data.');
      };
      img.src = dataUrl;
    },
    [baseImageDataUrl, pushUndoSnapshot]
  );

  // Cleanup countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Cancel countdown
  const handleCancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setCountdownTarget(null);
    setIsCapturing(false);
  };

  // Start capture with optional countdown
  const startCapture = (mode: 'area' | 'full') => {
    if (!isDisplayMediaSupported) {
      setShowUnsupportedModal(true);
      return;
    }

    setErrorMessage(null);

    if (delaySeconds > 0) {
      setCountdownTarget(mode);
      let count = delaySeconds;
      setCountdown(count);
      playCountdownBeep(600);

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      countdownIntervalRef.current = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setCountdown(null);
          setCountdownTarget(null);
          playCountdownBeep(1200);
          executeScreenCapture(mode);
        } else {
          setCountdown(count);
          playCountdownBeep(700);
        }
      }, 1000);
    } else {
      executeScreenCapture(mode);
    }
  };

  // Grab display frame from user
  const executeScreenCapture = async (mode: 'area' | 'full') => {
    setIsCapturing(true);
    setErrorMessage(null);

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        } as MediaTrackConstraints,
        audio: false,
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => resolve())
            .catch(reject);
        };
        video.onerror = reject;
      });

      // Small pause for rendering stability
      await new Promise((r) => setTimeout(r, 120));

      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = video.videoWidth || 1920;
      captureCanvas.height = video.videoHeight || 1080;
      const ctx = captureCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D rendering is unavailable');

      ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

      const capturedDataUrl = captureCanvas.toDataURL('image/png');

      if (mode === 'area') {
        // Open interactive full-frame snipping tool
        const img = new Image();
        img.onload = () => {
          setSnippingFrame(img);
          setSnippingSelection(null);
        };
        img.src = capturedDataUrl;
      } else {
        // Full screen capture loaded directly
        loadImageFromDataUrl(capturedDataUrl, false);
        setUndoStack([]);
        setRedoStack([]);
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        setErrorMessage(err.message || 'Screen capture was cancelled or failed.');
      }
    } finally {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCapturing(false);
    }
  };

  // Paste from clipboard
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                loadImageFromDataUrl(e.target.result as string);
              }
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      setErrorMessage('No image found in clipboard. Press Cmd+V / Ctrl+V to paste directly.');
    } catch {
      setErrorMessage('Clipboard permission was denied. Try pressing Cmd+V / Ctrl+V directly.');
    }
  }, [loadImageFromDataUrl]);

  // Window paste listener
  useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              if (evt.target?.result) {
                loadImageFromDataUrl(evt.target.result as string);
              }
            };
            reader.readAsDataURL(file);
            e.preventDefault();
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [loadImageFromDataUrl]);

  // Drag and drop image
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            loadImageFromDataUrl(evt.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Upload file picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          loadImageFromDataUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Map screen mouse events to canvas coordinates
  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Pixelate / mosaic rendering for blur annotation
  const applyPixelate = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, blockSize: number = 12) => {
      const normX = Math.round(Math.max(0, Math.min(x, x + w)));
      const normY = Math.round(Math.max(0, Math.min(y, y + h)));
      const normW = Math.round(Math.abs(w));
      const normH = Math.round(Math.abs(h));

      if (normW <= 0 || normH <= 0) return;

      const boundedW = Math.min(normW, ctx.canvas.width - normX);
      const boundedH = Math.min(normH, ctx.canvas.height - normY);
      if (boundedW <= 0 || boundedH <= 0) return;

      try {
        const imgData = ctx.getImageData(normX, normY, boundedW, boundedH);
        const data = imgData.data;

        for (let by = 0; by < boundedH; by += blockSize) {
          for (let bx = 0; bx < boundedW; bx += blockSize) {
            let r = 0,
              g = 0,
              b = 0,
              a = 0,
              count = 0;
            const curBlockW = Math.min(blockSize, boundedW - bx);
            const curBlockH = Math.min(blockSize, boundedH - by);

            for (let py = 0; py < curBlockH; py++) {
              for (let px = 0; px < curBlockW; px++) {
                const index = ((by + py) * boundedW + (bx + px)) * 4;
                r += data[index];
                g += data[index + 1];
                b += data[index + 2];
                a += data[index + 3];
                count++;
              }
            }

            const avgR = Math.round(r / count);
            const avgG = Math.round(g / count);
            const avgB = Math.round(b / count);
            const avgA = Math.round(a / count);

            for (let py = 0; py < curBlockH; py++) {
              for (let px = 0; px < curBlockW; px++) {
                const index = ((by + py) * boundedW + (bx + px)) * 4;
                data[index] = avgR;
                data[index + 1] = avgG;
                data[index + 2] = avgB;
                data[index + 3] = avgA;
              }
            }
          }
        }

        ctx.putImageData(imgData, normX, normY);

        // Add soft outline border to mark redacted zone
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(normX, normY, boundedW, boundedH);
        ctx.restore();
      } catch (err) {
        console.error('Pixelate error:', err);
      }
    },
    []
  );

  // Directional arrow rendering
  const drawArrow = useCallback(
    (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, arrowColor: string, width: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);
      const headLen = Math.max(14, width * 3.5);

      ctx.save();
      ctx.strokeStyle = arrowColor;
      ctx.fillStyle = arrowColor;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },
    []
  );

  // Text annotation rendering
  const drawTextShape = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      text: string,
      textColor: string,
      txtFontSize: number,
      hasBg: boolean
    ) => {
      if (!text) return;
      ctx.save();
      ctx.font = `600 ${txtFontSize}px Inter, -apple-system, sans-serif`;
      ctx.textBaseline = 'top';

      const lines = text.split('\n');
      const lineHeight = txtFontSize * 1.35;
      let maxW = 0;
      for (const line of lines) {
        const w = ctx.measureText(line).width;
        if (w > maxW) maxW = w;
      }
      const totalH = lines.length * lineHeight;
      const pad = txtFontSize * 0.35;

      if (hasBg) {
        const isLight = textColor === '#ffffff' || textColor === '#f59e0b';
        ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        const rx = x - pad;
        const ry = y - pad;
        const rw = maxW + pad * 2;
        const rh = totalH + pad * 2;
        ctx.roundRect(rx, ry, rw, rh, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
      }

      ctx.fillStyle = textColor;
      lines.forEach((line, i) => {
        ctx.fillText(line, x, y + i * lineHeight);
      });

      ctx.restore();
    },
    []
  );

  // Main canvas redraw function
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage) return;

    if (canvas.width !== baseImage.naturalWidth || canvas.height !== baseImage.naturalHeight) {
      canvas.width = baseImage.naturalWidth;
      canvas.height = baseImage.naturalHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw base image
    ctx.drawImage(baseImage, 0, 0);

    // 2. Draw committed annotations
    const allShapes = [...annotations];
    if (activeShapeRef.current) {
      allShapes.push(activeShapeRef.current);
    }

    // Process blur shapes first
    allShapes.forEach((shape) => {
      if (shape.type === 'blur') {
        applyPixelate(ctx, shape.x, shape.y, shape.width, shape.height, shape.blockSize);
      }
    });

    // Draw lines, arrows, rects, text
    allShapes.forEach((shape) => {
      if (shape.type === 'draw') {
        if (shape.points.length < 2) return;
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      } else if (shape.type === 'highlighter') {
        if (shape.points.length < 2) return;
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = Math.max(12, shape.width * 2.5);
        ctx.lineCap = 'square';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      } else if (shape.type === 'arrow') {
        drawArrow(ctx, shape.x1, shape.y1, shape.x2, shape.y2, shape.color, shape.width);
      } else if (shape.type === 'rect') {
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.widthBorder;
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        ctx.restore();
      } else if (shape.type === 'text') {
        drawTextShape(ctx, shape.x, shape.y, shape.text, shape.color, shape.fontSize, shape.hasBg);
      }
    });

    // 3. Draw crop overlay if in crop mode
    if (tool === 'crop' && cropBox) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, canvas.width, cropBox.y);
      ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.height);
      ctx.fillRect(cropBox.x + cropBox.width, cropBox.y, canvas.width - (cropBox.x + cropBox.width), cropBox.height);
      ctx.fillRect(0, cropBox.y + cropBox.height, canvas.width, canvas.height - (cropBox.y + cropBox.height));

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
      ctx.setLineDash([]);

      const handleSize = 10;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2;

      const corners = [
        { x: cropBox.x, y: cropBox.y },
        { x: cropBox.x + cropBox.width, y: cropBox.y },
        { x: cropBox.x, y: cropBox.y + cropBox.height },
        { x: cropBox.x + cropBox.width, y: cropBox.y + cropBox.height },
      ];

      corners.forEach((c) => {
        ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      });

      ctx.restore();
    }
  }, [baseImage, annotations, tool, cropBox, applyPixelate, drawArrow, drawTextShape]);

  // Keep canvas synced
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Handle Crop Initialization when entering Crop tool
  useEffect(() => {
    if (tool === 'crop' && baseImage && !cropBox) {
      const marginX = Math.round(baseImage.naturalWidth * 0.1);
      const marginY = Math.round(baseImage.naturalHeight * 0.1);
      setCropBox({
        x: marginX,
        y: marginY,
        width: Math.max(100, baseImage.naturalWidth - marginX * 2),
        height: Math.max(100, baseImage.naturalHeight - marginY * 2),
      });
    }
  }, [tool, baseImage, cropBox]);

  // Apply Crop
  const handleApplyCrop = () => {
    if (!cropBox || !canvasRef.current) return;

    const normX = Math.round(Math.max(0, Math.min(cropBox.x, cropBox.x + cropBox.width)));
    const normY = Math.round(Math.max(0, Math.min(cropBox.y, cropBox.y + cropBox.height)));
    const normW = Math.round(Math.abs(cropBox.width));
    const normH = Math.round(Math.abs(cropBox.height));

    if (normW < 10 || normH < 10) {
      setErrorMessage('Vùng cắt quá nhỏ (Selection too small).');
      return;
    }

    pushUndoSnapshot();

    const currentCanvas = canvasRef.current;
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = normW;
    croppedCanvas.height = normH;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return;

    croppedCtx.drawImage(currentCanvas, normX, normY, normW, normH, 0, 0, normW, normH);

    const croppedDataUrl = croppedCanvas.toDataURL('image/png');
    loadImageFromDataUrl(croppedDataUrl, false);
    setCropBox(null);
    setTool('draw');
  };

  const handleCancelCrop = () => {
    setCropBox(null);
    setTool('draw');
  };

  // -------------------------------------------------------------
  // Snipping Area Mode Logic (Chụp 1 vùng nhỏ trực tiếp)
  // -------------------------------------------------------------
  const redrawSnippingCanvas = useCallback(() => {
    const canvas = snippingCanvasRef.current;
    if (!canvas || !snippingFrame) return;

    if (canvas.width !== snippingFrame.naturalWidth || canvas.height !== snippingFrame.naturalHeight) {
      canvas.width = snippingFrame.naturalWidth;
      canvas.height = snippingFrame.naturalHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw whole screen frame
    ctx.drawImage(snippingFrame, 0, 0);

    // Dim the screen outside the active selection
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    if (!snippingSelection) {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const selX = Math.min(snippingSelection.x, snippingSelection.x + snippingSelection.width);
      const selY = Math.min(snippingSelection.y, snippingSelection.y + snippingSelection.height);
      const selW = Math.abs(snippingSelection.width);
      const selH = Math.abs(snippingSelection.height);

      ctx.fillRect(0, 0, canvas.width, selY);
      ctx.fillRect(0, selY, selX, selH);
      ctx.fillRect(selX + selW, selY, canvas.width - (selX + selW), selH);
      ctx.fillRect(0, selY + selH, canvas.width, canvas.height - (selY + selH));

      // Crisp emerald border around region
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(selX, selY, selW, selH);

      // Corner accent dots
      ctx.fillStyle = '#ffffff';
      const corners = [
        { x: selX, y: selY },
        { x: selX + selW, y: selY },
        { x: selX, y: selY + selH },
        { x: selX + selW, y: selY + selH },
      ];
      corners.forEach((c) => {
        ctx.fillRect(c.x - 4, c.y - 4, 8, 8);
      });
    }
  }, [snippingFrame, snippingSelection]);

  useEffect(() => {
    if (snippingFrame) {
      redrawSnippingCanvas();
    }
  }, [snippingFrame, redrawSnippingCanvas]);

  const getSnippingCoords = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = snippingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleSnippingMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getSnippingCoords(e);
    setSnipStartPos(coords);
    setSnippingSelection({ x: coords.x, y: coords.y, width: 0, height: 0 });
    setIsSnippingDrag(true);
  };

  const handleSnippingMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSnippingDrag) return;
    const coords = getSnippingCoords(e);
    setSnippingSelection({
      x: snipStartPos.x,
      y: snipStartPos.y,
      width: coords.x - snipStartPos.x,
      height: coords.y - snipStartPos.y,
    });
  };

  const handleSnippingMouseUp = () => {
    setIsSnippingDrag(false);
  };

  const handleConfirmSnippingArea = () => {
    if (!snippingFrame || !snippingSelection) return;

    const normX = Math.round(Math.max(0, Math.min(snippingSelection.x, snippingSelection.x + snippingSelection.width)));
    const normY = Math.round(Math.max(0, Math.min(snippingSelection.y, snippingSelection.y + snippingSelection.height)));
    const normW = Math.round(Math.abs(snippingSelection.width));
    const normH = Math.round(Math.abs(snippingSelection.height));

    if (normW < 10 || normH < 10) {
      setErrorMessage('Vui lòng chọn 1 vùng lớn hơn 10x10 px (Select a region larger than 10x10 px).');
      return;
    }

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = normW;
    croppedCanvas.height = normH;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return;

    croppedCtx.drawImage(snippingFrame, normX, normY, normW, normH, 0, 0, normW, normH);

    const croppedDataUrl = croppedCanvas.toDataURL('image/png');
    loadImageFromDataUrl(croppedDataUrl, false);
    setUndoStack([]);
    setRedoStack([]);

    // Exit snipping overlay
    setSnippingFrame(null);
    setSnippingSelection(null);
    setTool('draw');
  };

  const handleCancelSnipping = () => {
    setSnippingFrame(null);
    setSnippingSelection(null);
  };

  // -------------------------------------------------------------
  // Mouse and Touch Interaction Handlers
  // -------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!baseImage) return;
    const coords = getCanvasCoords(e);

    if (textInput) {
      commitTextInput();
      return;
    }

    if (tool === 'text') {
      setTextInput({
        x: coords.x,
        y: coords.y,
        text: '',
      });
      return;
    }

    if (tool === 'crop' && cropBox) {
      const handleTolerance = 20;
      const isNW = Math.hypot(coords.x - cropBox.x, coords.y - cropBox.y) < handleTolerance;
      const isNE = Math.hypot(coords.x - (cropBox.x + cropBox.width), coords.y - cropBox.y) < handleTolerance;
      const isSW = Math.hypot(coords.x - cropBox.x, coords.y - (cropBox.y + cropBox.height)) < handleTolerance;
      const isSE =
        Math.hypot(coords.x - (cropBox.x + cropBox.width), coords.y - (cropBox.y + cropBox.height)) < handleTolerance;

      if (isNW) setCropDragMode('nw');
      else if (isNE) setCropDragMode('ne');
      else if (isSW) setCropDragMode('sw');
      else if (isSE) setCropDragMode('se');
      else if (
        coords.x >= cropBox.x &&
        coords.x <= cropBox.x + cropBox.width &&
        coords.y >= cropBox.y &&
        coords.y <= cropBox.y + cropBox.height
      ) {
        setCropDragMode('move');
      } else {
        setCropDragMode('create');
        setCropBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
      }

      setCropStartPos(coords);
      setIsDrawing(true);
      return;
    }

    setIsDrawing(true);
    const shapeId = `shape_${Date.now()}_${Math.random()}`;

    if (tool === 'draw' || tool === 'highlighter') {
      activeShapeRef.current = {
        id: shapeId,
        type: tool,
        points: [coords],
        color,
        width: strokeWidth,
      };
    } else if (tool === 'arrow') {
      activeShapeRef.current = {
        id: shapeId,
        type: 'arrow',
        x1: coords.x,
        y1: coords.y,
        x2: coords.x,
        y2: coords.y,
        color,
        width: strokeWidth,
      };
    } else if (tool === 'rect') {
      activeShapeRef.current = {
        id: shapeId,
        type: 'rect',
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        color,
        widthBorder: strokeWidth,
      };
    } else if (tool === 'blur') {
      activeShapeRef.current = {
        id: shapeId,
        type: 'blur',
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        blockSize: 12,
      };
    }

    redrawCanvas();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !baseImage) return;
    const coords = getCanvasCoords(e);

    if (tool === 'crop' && cropBox) {
      const dx = coords.x - cropStartPos.x;
      const dy = coords.y - cropStartPos.y;

      if (cropDragMode === 'move') {
        setCropBox((prev) =>
          prev
            ? {
                ...prev,
                x: Math.max(0, Math.min(baseImage.naturalWidth - prev.width, prev.x + dx)),
                y: Math.max(0, Math.min(baseImage.naturalHeight - prev.height, prev.y + dy)),
              }
            : null
        );
        setCropStartPos(coords);
      } else if (cropDragMode === 'create') {
        setCropBox({
          x: Math.min(cropStartPos.x, coords.x),
          y: Math.min(cropStartPos.y, coords.y),
          width: Math.abs(coords.x - cropStartPos.x),
          height: Math.abs(coords.y - cropStartPos.y),
        });
      } else if (cropDragMode === 'se') {
        setCropBox((prev) => (prev ? { ...prev, width: coords.x - prev.x, height: coords.y - prev.y } : null));
      } else if (cropDragMode === 'sw') {
        setCropBox((prev) => (prev ? { ...prev, x: coords.x, width: prev.x + prev.width - coords.x, height: coords.y - prev.y } : null));
      } else if (cropDragMode === 'ne') {
        setCropBox((prev) => (prev ? { ...prev, y: coords.y, width: coords.x - prev.x, height: prev.y + prev.height - coords.y } : null));
      } else if (cropDragMode === 'nw') {
        setCropBox((prev) =>
          prev
            ? {
                x: coords.x,
                y: coords.y,
                width: prev.x + prev.width - coords.x,
                height: prev.y + prev.height - coords.y,
              }
            : null
        );
      }
      redrawCanvas();
      return;
    }

    if (!activeShapeRef.current) return;

    if (activeShapeRef.current.type === 'draw' || activeShapeRef.current.type === 'highlighter') {
      activeShapeRef.current.points.push(coords);
    } else if (activeShapeRef.current.type === 'arrow') {
      activeShapeRef.current.x2 = coords.x;
      activeShapeRef.current.y2 = coords.y;
    } else if (activeShapeRef.current.type === 'rect' || activeShapeRef.current.type === 'blur') {
      activeShapeRef.current.width = coords.x - activeShapeRef.current.x;
      activeShapeRef.current.height = coords.y - activeShapeRef.current.y;
    }

    redrawCanvas();
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (tool === 'crop') {
      setCropDragMode(null);
      setCropBox((prev) => {
        if (!prev) return null;
        return {
          x: prev.width < 0 ? prev.x + prev.width : prev.x,
          y: prev.height < 0 ? prev.y + prev.height : prev.y,
          width: Math.abs(prev.width),
          height: Math.abs(prev.height),
        };
      });
      return;
    }

    if (activeShapeRef.current) {
      const shape = activeShapeRef.current;
      let isValid = false;

      if (shape.type === 'draw' || shape.type === 'highlighter') {
        isValid = shape.points.length > 1;
      } else if (shape.type === 'arrow') {
        isValid = Math.hypot(shape.x2 - shape.x1, shape.y2 - shape.y1) > 5;
      } else if (shape.type === 'rect' || shape.type === 'blur') {
        if (shape.width < 0) {
          shape.x += shape.width;
          shape.width = Math.abs(shape.width);
        }
        if (shape.height < 0) {
          shape.y += shape.height;
          shape.height = Math.abs(shape.height);
        }
        isValid = shape.width > 5 && shape.height > 5;
      }

      if (isValid) {
        pushUndoSnapshot();
        setAnnotations((prev) => [...prev, shape]);
      }

      activeShapeRef.current = null;
      redrawCanvas();
    }
  };

  // Commit text input
  const commitTextInput = () => {
    if (textInput && textInput.text.trim()) {
      pushUndoSnapshot();
      const newTextShape: TextShape = {
        id: `text_${Date.now()}`,
        type: 'text',
        x: textInput.x,
        y: textInput.y,
        text: textInput.text.trim(),
        color,
        fontSize,
        hasBg: textWithBg,
      };
      setAnnotations((prev) => [...prev, newTextShape]);
    }
    setTextInput(null);
  };

  const changeTool = (newTool: ToolMode) => {
    if (textInput) {
      commitTextInput();
    }
    setTool(newTool);
  };

  // Touch event adapters
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    handleMouseDown({
      clientX: touch.clientX,
      clientY: touch.clientY,
    } as any);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    handleMouseMove({
      clientX: touch.clientX,
      clientY: touch.clientY,
    } as any);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    setRedoStack((prev) => [
      ...prev,
      {
        annotations: JSON.parse(JSON.stringify(annotations)),
        baseImageDataUrl,
      },
    ]);

    if (previous.baseImageDataUrl !== baseImageDataUrl) {
      loadImageFromDataUrl(previous.baseImageDataUrl, false);
    }
    setAnnotations(previous.annotations);
  }, [undoStack, annotations, baseImageDataUrl, loadImageFromDataUrl]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));

    setUndoStack((prev) => [
      ...prev,
      {
        annotations: JSON.parse(JSON.stringify(annotations)),
        baseImageDataUrl,
      },
    ]);

    if (next.baseImageDataUrl !== baseImageDataUrl) {
      loadImageFromDataUrl(next.baseImageDataUrl, false);
    }
    setAnnotations(next.annotations);
  }, [redoStack, annotations, baseImageDataUrl, loadImageFromDataUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (snippingFrame) {
        if (e.key === 'Escape') {
          handleCancelSnipping();
        } else if (e.key === 'Enter') {
          handleConfirmSnippingArea();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        if (tool === 'crop') handleCancelCrop();
        if (textInput) setTextInput(null);
      } else if (e.key === 'Enter' && tool === 'crop') {
        e.preventDefault();
        handleApplyCrop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, tool, textInput, cropBox, snippingFrame, snippingSelection]);

  // Clear all annotations
  const handleClearAnnotations = () => {
    if (annotations.length === 0) return;
    pushUndoSnapshot();
    setAnnotations([]);
  };

  // Reset to empty state
  const handleResetImage = () => {
    setBaseImage(null);
    setBaseImageDataUrl('');
    setAnnotations([]);
    setUndoStack([]);
    setRedoStack([]);
    setCropBox(null);
    setTextInput(null);
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopiedNotice(true);
          setTimeout(() => setCopiedNotice(false), 2000);
        } else {
          setErrorMessage('Trình duyệt không hỗ trợ sao chép hình ảnh vào bộ nhớ tạm.');
        }
      }, 'image/png');
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể sao chép ảnh vào clipboard.');
    }
  };

  // Download Image
  const handleDownload = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, 0.92);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    link.download = `screenshot_${timestamp}.${format}`;
    link.href = dataUrl;
    link.click();
  };

  // Zoom controls
  const handleZoom = (factor: number) => {
    setZoomMode('manual');
    setZoomLevel((prev) => Math.max(0.2, Math.min(3.0, Number((prev * factor).toFixed(2)))));
  };

  const handleFitZoom = () => {
    setZoomMode('fit');
    setZoomLevel(1);
  };

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex-1 flex flex-col h-full min-h-0 space-y-3"
    >
      {/* Error alert */}
      {errorMessage && (
        <div role="alert" className="rounded-xl p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs hover:underline cursor-pointer ml-3 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Desktop Screen Capture Guide Modal */}
      {showUnsupportedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="card-3d p-6 rounded-2xl flex flex-col gap-4 max-w-md w-full shadow-2xl border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 font-bold text-sm text-[var(--text-primary)]">
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <span>Chụp màn hình trên Desktop</span>
              </div>
              <button
                type="button"
                onClick={() => setShowUnsupportedModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[var(--text-secondary)] space-y-3 leading-relaxed">
              <p>
                Trên ứng dụng Desktop (do cơ chế bảo mật hệ thống sandbox), tính năng ghi màn hình Web API bị hạn chế.
                Bạn có thể chụp màn hình siêu nhanh bằng phím tắt hệ thống:
              </p>

              <div className="p-3.5 rounded-xl bg-[var(--surface-recessed)] space-y-2.5 font-sans">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>
                    Nhấn <strong className="text-[var(--text-primary)] font-mono">{isMac ? 'Cmd + Ctrl + Shift + 4' : 'Win + Shift + S'}</strong> để chọn vùng chụp thẳng vào Clipboard (hoặc <strong className="text-[var(--text-primary)] font-mono">{isMac ? 'Cmd + Shift + 4' : 'Print Screen'}</strong>).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>
                    Quay lại HappyDev và nhấn <strong className="text-[var(--text-primary)] font-mono">{isMac ? 'Cmd + V' : 'Ctrl + V'}</strong> (hoặc bấm nút "Dán ảnh" bên dưới) để chỉnh sửa & chú thích ngay!
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => {
                  setShowUnsupportedModal(false);
                  handlePasteFromClipboard();
                }}
                className="btn-3d flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition cursor-pointer shadow-sm"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Dán ngay từ Clipboard</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsupportedModal(false);
                  fileInputRef.current?.click();
                }}
                className="btn-3d px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer"
              >
                Mở tệp ảnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Active Countdown Modal */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="card-3d p-6 rounded-2xl flex flex-col items-center gap-3 text-center max-w-xs shadow-2xl border border-emerald-500/30">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-3xl font-black font-mono animate-pulse">
              {countdown}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                {countdownTarget === 'area' ? 'Đang chuẩn bị chụp vùng...' : 'Đang chuẩn bị chụp màn hình...'}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Chuyển sang cửa sổ cần chụp ({countdown}s)
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancelCountdown}
              className="btn-3d flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Huỷ chụp (Cancel)</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Fullscreen Area Snipping Overlay (Chụp 1 vùng nhỏ) */}
      {snippingFrame && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 select-none">
          {/* Top Snipping Header & Instructions */}
          <div className="p-3 bg-slate-900 border-b border-white/10 flex items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-2 text-xs">
              <Crosshair className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-emerald-400">Chế độ chụp vùng:</span>
              <span className="text-slate-300">
                Nhấn giữ và kéo chuột để chọn vùng cần chụp. Nhấn Enter để xác nhận, Esc để huỷ.
              </span>
            </div>

            <div className="flex items-center gap-2">
              {snippingSelection && Math.abs(snippingSelection.width) > 5 && Math.abs(snippingSelection.height) > 5 && (
                <div className="text-xs font-mono text-emerald-400 mr-2 bg-emerald-500/10 px-2 py-1 rounded">
                  {Math.round(Math.abs(snippingSelection.width))} × {Math.round(Math.abs(snippingSelection.height))} px
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmSnippingArea}
                disabled={!snippingSelection || Math.abs(snippingSelection.width) < 10 || Math.abs(snippingSelection.height) < 10}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lấy vùng này (Enter)</span>
              </button>

              <button
                type="button"
                onClick={handleCancelSnipping}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Huỷ (Esc)</span>
              </button>
            </div>
          </div>

          {/* Snipping Canvas Area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-2 relative bg-black">
            <canvas
              ref={snippingCanvasRef}
              onMouseDown={handleSnippingMouseDown}
              onMouseMove={handleSnippingMouseMove}
              onMouseUp={handleSnippingMouseUp}
              className="cursor-crosshair block max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Top Capture & Toolbar Header */}
      <div className="card-3d p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Capture Action Triggers */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isDisplayMediaSupported ? (
            <>
              {/* Primary Action 1: Capture Area (Chụp 1 vùng nhỏ) */}
              <button
                type="button"
                onClick={() => startCapture('area')}
                disabled={isCapturing}
                className="btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition cursor-pointer shadow-sm disabled:opacity-50"
                title="Chụp 1 vùng nhỏ màn hình (Kéo chuột chọn vùng)"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Chụp vùng (Area)</span>
              </button>

              {/* Primary Action 2: Capture Full Screen */}
              <button
                type="button"
                onClick={() => startCapture('full')}
                disabled={isCapturing}
                className="btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition cursor-pointer disabled:opacity-50"
                title="Chụp toàn bộ cửa sổ hoặc màn hình"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Toàn màn hình</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition cursor-pointer shadow-sm"
                title={`Dán ảnh chụp màn hình từ Clipboard (${isMac ? 'Cmd+V' : 'Ctrl+V'})`}
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Dán ảnh ({isMac ? 'Cmd+V' : 'Ctrl+V'})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUnsupportedModal(true)}
                className="btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-700 hover:bg-sky-50 transition cursor-pointer"
                title="Xem phím tắt chụp màn hình trên máy"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Phím tắt chụp</span>
              </button>
            </>
          )}

          {/* Countdown Selector */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--surface-recessed)] text-[11px] text-[var(--text-secondary)] border border-slate-200">
            <Clock className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Hẹn giờ:</span>
            <select
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Number(e.target.value))}
              className="bg-transparent outline-none cursor-pointer text-[11px] font-semibold text-[var(--text-primary)]"
              title="Đếm ngược trước khi chụp ảnh"
            >
              <option value={0}>Ngay lập tức (0s)</option>
              <option value={3}>3 giây</option>
              <option value={5}>5 giây</option>
              <option value={10}>10 giây</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            title="Dán ảnh từ clipboard (Cmd+V)"
          >
            <Clipboard className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Dán (Paste)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            title="Mở ảnh từ máy tính"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Mở ảnh</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Right: History & Export Actions */}
        {baseImage && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="btn-3d p-1.5 rounded-lg text-xs disabled:opacity-30 cursor-pointer"
              title="Hoàn tác (Undo Cmd+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="btn-3d p-1.5 rounded-lg text-xs disabled:opacity-30 cursor-pointer"
              title="Làm lại (Redo Cmd+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClearAnnotations}
              disabled={annotations.length === 0}
              className="btn-3d p-1.5 rounded-lg text-xs text-rose-500 disabled:opacity-30 cursor-pointer"
              title="Xoá tất cả nét vẽ / ghi chú"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            <button
              type="button"
              onClick={handleCopyImage}
              className="btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              title="Sao chép ảnh vào clipboard"
            >
              {copiedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Đã chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sao chép</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleDownload('png')}
              className="btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-emerald-700"
              title="Lưu ảnh định dạng PNG gốc"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Lưu PNG</span>
            </button>

            <button
              type="button"
              onClick={handleResetImage}
              className="btn-3d p-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
              title="Đóng ảnh hiện tại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Annotation Tool Selection Bar (Active when an image is loaded) */}
      {baseImage && (
        <div className="card-3d p-2 rounded-xl flex flex-wrap items-center justify-between gap-2">
          {/* Tool Modes */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => changeTool('draw')}
              className={`btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                tool === 'draw' ? 'btn-3d-active text-emerald-500' : 'text-[var(--text-secondary)]'
              }`}
              title="Vẽ tự do (Draw / Pen)"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Vẽ (Draw)</span>
            </button>

            <button
              type="button"
              onClick={() => changeTool('blur')}
              className={`btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                tool === 'blur' ? 'btn-3d-active text-amber-500' : 'text-[var(--text-secondary)]'
              }`}
              title="Làm mờ / Che thông tin nhạy cảm (Blur / Redact)"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Làm mờ (Blur)</span>
            </button>

            <button
              type="button"
              onClick={() => changeTool('arrow')}
              className={`btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                tool === 'arrow' ? 'btn-3d-active text-rose-500' : 'text-[var(--text-secondary)]'
              }`}
              title="Mũi tên chỉ dẫn (Arrow)"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Mũi tên (Arrow)</span>
            </button>

            <button
              type="button"
              onClick={() => changeTool('crop')}
              className={`btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                tool === 'crop' ? 'btn-3d-active text-purple-500' : 'text-[var(--text-secondary)]'
              }`}
              title="Cắt bớt ảnh (Crop)"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Cắt (Crop)</span>
            </button>

            <button
              type="button"
              onClick={() => changeTool('text')}
              className={`btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                tool === 'text' ? 'btn-3d-active text-sky-500' : 'text-[var(--text-secondary)]'
              }`}
              title="Chèn văn bản (Text)"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Văn bản (Text)</span>
            </button>

            <button
              type="button"
              onClick={() => changeTool('rect')}
              className={`btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                tool === 'rect' ? 'btn-3d-active text-indigo-500' : 'text-[var(--text-secondary)]'
              }`}
              title="Khung chữ nhật (Box)"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Khung (Box)</span>
            </button>

            <button
              type="button"
              onClick={() => changeTool('highlighter')}
              className={`btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                tool === 'highlighter' ? 'btn-3d-active text-yellow-500' : 'text-[var(--text-secondary)]'
              }`}
              title="Bút dạ quang (Highlighter)"
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span>Dạ quang</span>
            </button>
          </div>

          {/* Tool Options (Color, Size, Crop actions) */}
          <div className="flex items-center gap-2 flex-wrap">
            {tool === 'crop' ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="btn-3d flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Áp dụng cắt</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelCrop}
                  className="btn-3d px-2 py-1 rounded-lg text-xs text-[var(--text-muted)] cursor-pointer"
                >
                  Huỷ
                </button>
              </div>
            ) : (
              <>
                {/* Color Palette */}
                {tool !== 'blur' && (
                  <div className="flex items-center gap-1">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setColor(p.hex)}
                        className={`w-5 h-5 rounded-full transition-transform cursor-pointer border ${
                          color === p.hex ? 'scale-125 border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: p.hex }}
                        title={p.label}
                      />
                    ))}
                    <label className="flex items-center cursor-pointer ml-0.5" title="Chọn màu tuỳ chỉnh">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                    </label>
                  </div>
                )}

                {/* Stroke width or Font size */}
                {tool === 'text' ? (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[var(--text-muted)] text-[11px]">Cỡ chữ:</span>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="bg-[var(--surface-recessed)] text-[var(--text-primary)] rounded px-1.5 py-0.5 text-xs outline-none"
                    >
                      {FONT_SIZES.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label} ({f.value}px)
                        </option>
                      ))}
                    </select>

                    <label className="flex items-center gap-1 cursor-pointer ml-1 select-none text-[11px] text-[var(--text-secondary)]">
                      <input
                        type="checkbox"
                        checked={textWithBg}
                        onChange={(e) => setTextWithBg(e.target.checked)}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <span>Nền nổi</span>
                    </label>
                  </div>
                ) : tool !== 'blur' ? (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[var(--text-muted)] text-[11px]">Độ dày:</span>
                    <select
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(Number(e.target.value))}
                      className="bg-[var(--surface-recessed)] text-[var(--text-primary)] rounded px-1.5 py-0.5 text-xs outline-none"
                    >
                      {STROKE_WIDTHS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label} ({s.value}px)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {/* Zoom controls */}
                <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleZoom(0.8)}
                    className="btn-3d p-1 rounded text-xs cursor-pointer"
                    title="Thu nhỏ"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleFitZoom}
                    className={`btn-3d px-1.5 py-1 rounded text-[11px] cursor-pointer font-mono ${
                      zoomMode === 'fit' ? 'btn-3d-active text-emerald-500' : ''
                    }`}
                    title="Vừa màn hình"
                  >
                    <Maximize2 className="w-3 h-3 inline mr-0.5" />
                    <span>Fit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoom(1.25)}
                    className="btn-3d p-1 rounded text-xs cursor-pointer"
                    title="Phóng to"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Canvas Stage or Empty State */}
      <div className="flex-1 min-h-[380px] card-3d rounded-xl flex flex-col overflow-hidden relative select-none">
        {baseImage ? (
          <div className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-4 bg-[var(--surface-recessed)]/50 relative">
            <div
              className="relative shadow-2xl rounded border border-slate-200 overflow-hidden"
              style={{
                width: zoomMode === 'fit' ? 'auto' : `${baseImage.naturalWidth * zoomLevel}px`,
                height: zoomMode === 'fit' ? 'auto' : `${baseImage.naturalHeight * zoomLevel}px`,
                maxWidth: zoomMode === 'fit' ? '100%' : 'none',
                maxHeight: zoomMode === 'fit' ? '100%' : 'none',
              }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`block ${
                  tool === 'draw' || tool === 'highlighter'
                    ? 'cursor-crosshair'
                    : tool === 'arrow'
                    ? 'cursor-crosshair'
                    : tool === 'text'
                    ? 'cursor-text'
                    : tool === 'blur'
                    ? 'cursor-cell'
                    : tool === 'crop'
                    ? 'cursor-move'
                    : 'cursor-crosshair'
                }`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />

              {/* Live Inline Text Input Overlay */}
              {textInput && canvasRef.current && (
                <div
                  className="absolute z-30"
                  style={{
                    left: `${(textInput.x / canvasRef.current.width) * 100}%`,
                    top: `${(textInput.y / canvasRef.current.height) * 100}%`,
                  }}
                >
                  <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-lg shadow-xl border border-white/20">
                    <input
                      ref={textInputRef}
                      type="text"
                      value={textInput.text}
                      onChange={(e) => setTextInput((prev) => (prev ? { ...prev, text: e.target.value } : null))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          commitTextInput();
                        } else if (e.key === 'Escape') {
                          setTextInput(null);
                        }
                      }}
                      placeholder="Nhập nội dung & Enter..."
                      className="px-2 py-1 text-xs text-white bg-transparent outline-none min-w-[180px] font-sans"
                    />
                    <button
                      type="button"
                      onClick={commitTextInput}
                      className="px-2 py-1 bg-emerald-500 text-white rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty / Initial State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
              <Crosshair className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Chụp ảnh màn hình & Chú thích (Screen Capture)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Hỗ trợ chụp 1 vùng nhỏ bất kỳ hoặc toàn màn hình với bộ hẹn giờ đếm ngược.
                Dễ dàng vẽ tự do, làm mờ dữ liệu nhạy cảm (blur), vẽ mũi tên, cắt ảnh và thêm ghi chú văn bản.
              </p>
            </div>

            {!isDisplayMediaSupported && (
              <div className="px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center gap-2 max-w-md text-left">
                <span className="font-bold shrink-0">💡 Phím tắt chụp nhanh:</span>
                <span>Nhấn <strong className="font-mono font-bold text-[var(--text-primary)]">{isMac ? 'Cmd + Ctrl + Shift + 4' : 'Win + Shift + S'}</strong> để chụp vào Clipboard, rồi nhấn <strong className="font-mono font-bold text-[var(--text-primary)]">{isMac ? 'Cmd + V' : 'Ctrl + V'}</strong> để dán ảnh vào chỉnh sửa ngay lập tức!</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {isDisplayMediaSupported ? (
                <>
                  <button
                    type="button"
                    onClick={() => startCapture('area')}
                    className="btn-3d flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md cursor-pointer"
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>Chụp 1 vùng nhỏ (Capture Area)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startCapture('full')}
                    className="btn-3d flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-emerald-700"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Toàn màn hình</span>
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className={`btn-3d flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-md ${
                  !isDisplayMediaSupported
                    ? 'text-white bg-emerald-600 hover:bg-emerald-500'
                    : ''
                }`}
              >
                <Clipboard className="w-4 h-4 text-sky-400" />
                <span>Dán từ bộ nhớ tạm ({isMac ? 'Cmd+V' : 'Ctrl+V'})</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-3d flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-purple-700"
              >
                <Upload className="w-4 h-4" />
                <span>Mở tệp ảnh</span>
              </button>

              {!isDisplayMediaSupported && (
                <button
                  type="button"
                  onClick={() => setShowUnsupportedModal(true)}
                  className="btn-3d flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-sky-700 hover:bg-sky-50 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Hướng dẫn phím tắt</span>
                </button>
              )}
            </div>

            <div className="pt-4 text-[11px] text-[var(--text-muted)] flex items-center gap-4 flex-wrap justify-center">
              <span>🎯 Chụp vùng hoặc toàn màn hình</span>
              <span>•</span>
              <span>⏱️ Hẹn giờ 3s, 5s, 10s</span>
              <span>•</span>
              <span>🔒 Xử lý 100% offline trên máy</span>
              <span>•</span>
              <span>⚡ Hoàn toàn nhẹ (Lightweight)</span>
            </div>
          </div>
        )}

        {/* Bottom Status & Info Bar */}
        {baseImage && (
          <div className="px-3 py-1.5 border-t border-slate-200 bg-[var(--surface-elevated)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <div className="flex items-center gap-3">
              <span>
                {baseImage.naturalWidth} × {baseImage.naturalHeight} px
              </span>
              <span>•</span>
              <span className="capitalize">Công cụ: {tool}</span>
              {annotations.length > 0 && (
                <>
                  <span>•</span>
                  <span>{annotations.length} chú thích</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span>Cmd+Z: Hoàn tác</span>
              <span>•</span>
              <span>Cmd+V: Dán ảnh</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
