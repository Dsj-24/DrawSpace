import { Tool } from "@/components/Canvas";
import { getExistingShapes, deleteShape, updateShape } from "./http";

// ---------------- Types ----------------
type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "pencil"; points: { x: number; y: number }[] }
  | { type: "triangle"; x: number; y: number; width: number; height: number };

type ShapeRow = {
  id: number;                 // chat.id in DB (negative while optimistic)
  shape: Shape;
  clientMsgId?: string;       // used to reconcile optimistic -> real
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: ShapeRow[] = [];

  private roomId: string;
  private clicked = false;
  private startX = 0;
  private startY = 0;

  private selectedTool: Tool = "circle";
  private pencilPoints: { x: number; y: number }[] = [];
  private eraseRadius = 10; // px tolerance around strokes while erasing

  // --- move state ---
  private dragging = false;
  private dragStart = { x: 0, y: 0 };
  private selectedRow: ShapeRow | null = null;
  private selectedIndex = -1;

  // maps clientMsgId -> index in existingShapes while pending
  private pendingByClientMsgId = new Map<string, number>();

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();

    const join = () =>
      this.socket.send(JSON.stringify({ type: "join_room", roomId: this.roomId }));
    if (this.socket.readyState === WebSocket.OPEN) join();
    else this.socket.addEventListener("open", join);
  }

  // ---------- lifecycle ----------
  destroy() {
    try {
      this.socket.send(JSON.stringify({ type: "leave_room", roomId: this.roomId }));
    } catch {}
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
    // clear any in-progress move if switching away
    if (tool !== "move") {
      this.dragging = false;
      this.selectedRow = null;
      this.selectedIndex = -1;
    }
  }

  async init() {
    // Expecting getExistingShapes(roomId) -> Array<{ id, shape }>
    this.existingShapes = await getExistingShapes(this.roomId);
    this.redraw();
  }

  // ---------- WS handlers ----------
  initHandlers() {
    this.socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "chat") {
        // Server broadcast: { type:"chat", id: number, roomId, message: string, clientMsgId?: string }
        const { id, message, clientMsgId } = msg;

        let parsed: any;
        try {
          parsed = JSON.parse(message);
        } catch {
          return;
        }
        const shape: Shape | undefined = parsed?.shape;
        if (!shape) return;

        // confirm our optimistic row
        if (clientMsgId && this.pendingByClientMsgId.has(clientMsgId)) {
          const idx = this.pendingByClientMsgId.get(clientMsgId)!;
          if (this.existingShapes[idx]) {
            this.existingShapes[idx].id = Number(id);
            delete this.existingShapes[idx].clientMsgId;
          }
          this.pendingByClientMsgId.delete(clientMsgId);
          this.redraw();
          return;
        }

        // or a shape from others
        this.existingShapes.push({ id: Number(id), shape });
        this.redraw();
      }

      if (msg.type === "delete") {
        const id = Number(msg.shapeId);
        if (Number.isFinite(id)) {
          this.existingShapes = this.existingShapes.filter((r) => r.id !== id);
          // clear selection if deleted
          if (this.selectedRow?.id === id) {
            this.dragging = false;
            this.selectedRow = null;
            this.selectedIndex = -1;
          }
          this.redraw();
        }
      }

      if (msg.type === "update") {
        // {type:"update", roomId, shapeId, shape}
        const id = Number(msg.shapeId);
        const shape = msg.shape as Shape;
        const idx = this.existingShapes.findIndex((r) => r.id === id);
        if (idx >= 0) {
          this.existingShapes[idx] = { id, shape };
          // keep selection in sync if we were moving this
          if (this.selectedRow?.id === id) {
            this.selectedRow = this.existingShapes[idx];
            this.selectedIndex = idx;
          }
          this.redraw();
        }
      }
    };
  }

  // ---------- drawing ----------
  private redraw() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    // background (keep it consistent with your page)
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.strokeStyle = "rgba(255,255,255)";
    for (const row of this.existingShapes) {
      const s = row.shape;
      if (!s) continue;

      if (s.type === "rect") {
        this.ctx.strokeRect(s.x, s.y, s.width, s.height);
      } else if (s.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(s.centerX, s.centerY, Math.abs(s.radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (s.type === "triangle") {
        this.ctx.beginPath();
        this.ctx.moveTo(s.x, s.y);
        this.ctx.lineTo(s.x + s.width, s.y);
        this.ctx.lineTo(s.x + s.width / 2, s.y + s.height);
        this.ctx.closePath();
        this.ctx.stroke();
      } else if (s.type === "pencil") {
        this.ctx.beginPath();
        for (let i = 0; i < s.points.length - 1; i++) {
          const p1 = s.points[i];
          const p2 = s.points[i + 1];
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  }

  // ---------- geometry helpers ----------
  private translateShape(s: Shape, dx: number, dy: number): Shape {
    if (s.type === "rect")     return { ...s, x: s.x + dx, y: s.y + dy };
    if (s.type === "circle")   return { ...s, centerX: s.centerX + dx, centerY: s.centerY + dy };
    if (s.type === "triangle") return { ...s, x: s.x + dx, y: s.y + dy };
    // pencil
    return { type: "pencil", points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
  }

  private hitTopmost(px: number, py: number): { row: ShapeRow; index: number } | null {
    // topmost = last drawn
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const row = this.existingShapes[i];
      if (this.isPointOnShape(px, py, row.shape, 8)) {
        return { row, index: i };
      }
    }
    return null;
  }

  // ---------- mouse ----------
  private toCanvasCoords(e: MouseEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    const { x, y } = this.toCanvasCoords(e);
    this.startX = x;
    this.startY = y;

    if (this.selectedTool === "pencil") {
      this.pencilPoints = [{ x, y }];
    }

    if (this.selectedTool === "eraser") {
      this.eraseAt(x, y);
      return;
    }

    // begin move if the tool is move and we hit a shape
    if (this.selectedTool === "move") {
      const hit = this.hitTopmost(x, y);
      if (hit) {
        this.dragging = true;
        this.dragStart = { x, y };
        this.selectedRow = hit.row;
        this.selectedIndex = hit.index;
      } else {
        this.dragging = false;
        this.selectedRow = null;
        this.selectedIndex = -1;
      }
      return;
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const { x, y } = this.toCanvasCoords(e);

    if (this.selectedTool === "eraser") {
      this.eraseAt(x, y);
      return;
    }

    // live move preview
    if (this.selectedTool === "move" && this.dragging && this.selectedRow && this.selectedIndex >= 0) {
      const dx = x - this.dragStart.x;
      const dy = y - this.dragStart.y;

      const moved = this.translateShape(this.selectedRow.shape, dx, dy);
      const copy = [...this.existingShapes];
      copy[this.selectedIndex] = { ...this.selectedRow, shape: moved };
      this.existingShapes = copy;
      this.redraw();
      return;
    }

    // live preview for create tools
    const width = x - this.startX;
    const height = y - this.startY;

    this.redraw();
    this.ctx.strokeStyle = "rgba(255,255,255)";

    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      const cx = this.startX + radius;
      const cy = this.startY + radius;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, Math.abs(radius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "triangle") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(this.startX + width, this.startY);
      this.ctx.lineTo(this.startX + width / 2, this.startY + height);
      this.ctx.closePath();
      this.ctx.stroke();
    } else if (this.selectedTool === "pencil") {
      this.pencilPoints.push({ x, y });
      this.ctx.beginPath();
      for (let i = 0; i < this.pencilPoints.length - 1; i++) {
        const p1 = this.pencilPoints[i];
        const p2 = this.pencilPoints[i + 1];
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
      }
      this.ctx.stroke();
      this.ctx.closePath();
    }
  };

  mouseUpHandler = async (e: MouseEvent) => {
    if (this.selectedTool === "eraser") {
      this.clicked = false;
      return;
    }

    // finish move
    if (this.selectedTool === "move") {
      this.clicked = false;
      if (this.dragging && this.selectedRow && this.selectedIndex >= 0) {
        const { x, y } = this.toCanvasCoords(e);
        const dx = x - this.dragStart.x;
        const dy = y - this.dragStart.y;

        const finalShape = this.translateShape(this.selectedRow.shape, dx, dy);
        const id = this.selectedRow.id;

        // persist + broadcast
        try {
          await updateShape(this.roomId, String(id), finalShape);
          this.socket.send(
            JSON.stringify({ type: "update", roomId: this.roomId, shapeId: id, shape: finalShape })
          );
        } catch (err) {
          console.error("Failed to update shape", id, err);
        }

        // clear move state
        this.dragging = false;
        this.selectedRow = null;
        this.selectedIndex = -1;
      }
      return;
    }

    // create shapes
    const { x, y } = this.toCanvasCoords(e);
    this.clicked = false;

    const width = x - this.startX;
    const height = y - this.startY;

    let shape: Shape | null = null;

    if (this.selectedTool === "rect") {
      shape = { type: "rect", x: this.startX, y: this.startY, width, height };
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      };
    } else if (this.selectedTool === "triangle") {
      shape = { type: "triangle", x: this.startX, y: this.startY, width, height };
    } else if (this.selectedTool === "pencil") {
      if (this.pencilPoints.length > 1) {
        shape = { type: "pencil", points: this.pencilPoints };
      }
    }

    if (!shape) return;

    // optimistic add with temp id + clientMsgId
    const clientMsgId = uid();
    const tempRow: ShapeRow = { id: -Date.now(), shape, clientMsgId };
    this.existingShapes.push(tempRow);
    this.pendingByClientMsgId.set(clientMsgId, this.existingShapes.length - 1);
    this.redraw();

    this.socket.send(
      JSON.stringify({
        type: "chat",
        roomId: this.roomId,
        message: JSON.stringify({ shape }),
        clientMsgId,
      })
    );
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  // ---------- Eraser ----------
  private async eraseAt(px: number, py: number) {
    // collect all hits at this point; ignore still-pending (negative id) shapes
    const hits = this.existingShapes.filter(
      (r) => r.id > 0 && this.isPointOnShape(px, py, r.shape, this.eraseRadius)
    );
    if (hits.length === 0) return;

    // Optimistic remove
    const ids = new Set(hits.map((h) => h.id));
    this.existingShapes = this.existingShapes.filter((r) => !ids.has(r.id));
    this.redraw();

    // Persist deletes + broadcast
    for (const id of ids) {
      try {
        await deleteShape(this.roomId, String(id));
        this.socket.send(
          JSON.stringify({ type: "delete", roomId: this.roomId, shapeId: id })
        );
      } catch (err) {
        console.error("Failed to delete shape", id, err);
      }
    }
  }

  // ---------- hit-testing ----------
  private isPointOnShape(px: number, py: number, s: Shape, tol = 6): boolean {
    if (s.type === "rect") {
      return px >= s.x && px <= s.x + s.width && py >= s.y && py <= s.y + s.height;
    }
    if (s.type === "circle") {
      const dx = px - s.centerX;
      const dy = py - s.centerY;
      const dist = Math.hypot(dx, dy);
      // consider both stroke ring and filled circle for better UX
      return Math.abs(dist - Math.abs(s.radius)) <= tol || dist <= Math.abs(s.radius);
    }
    if (s.type === "triangle") {
      const x1 = s.x, y1 = s.y;
      const x2 = s.x + s.width, y2 = s.y;
      const x3 = s.x + s.width / 2, y3 = s.y + s.height;
      const area = (xa: number, ya: number, xb: number, yb: number, xc: number, yc: number) =>
        Math.abs((xa * (yb - yc) + xb * (yc - ya) + xc * (ya - yb)) / 2);
      const A = area(x1, y1, x2, y2, x3, y3);
      const A1 = area(px, py, x2, y2, x3, y3);
      const A2 = area(x1, y1, px, py, x3, y3);
      const A3 = area(x1, y1, x2, y2, px, py);
      return Math.abs(A - (A1 + A2 + A3)) <= Math.max(1, tol);
    }
    if (s.type === "pencil") {
      for (let i = 0; i < s.points.length - 1; i++) {
        const p1 = s.points[i];
        const p2 = s.points[i + 1];
        if (this.pointToSegmentDist(px, py, p1.x, p1.y, p2.x, p2.y) <= tol) return true;
      }
      return false;
    }
    return false;
  }

  private pointToSegmentDist(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let t = lenSq ? dot / lenSq : -1;
    t = Math.max(0, Math.min(1, t));
    const xx = x1 + t * C;
    const yy = y1 + t * D;
    return Math.hypot(px - xx, py - yy);
  }
}
