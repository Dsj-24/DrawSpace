import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";


type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | { type: "pencil"; points: { x: number; y: number }[] } | {
    type: "triangle";
    x: number;
    y: number;
    width: number;
    height: number;
}


export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";

    socket: WebSocket;

    private pencilPoints: { x: number; y: number }[] = [];


    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();

    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    setTool(tool: "circle" | "pencil" | "rect" | "triangle") {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log(this.existingShapes);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.map((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                console.log(shape);
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else if (shape.type === "triangle") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.x, shape.y);
                this.ctx.lineTo(shape.x + shape.width, shape.y);
                this.ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
                this.ctx.closePath();
                this.ctx.stroke();
            } else if (shape.type === "pencil") {
                this.ctx.beginPath();
                for (let i = 0; i < shape.points.length - 1; i++) {
                    const p1 = shape.points[i];
                    const p2 = shape.points[i + 1];
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            }

        })


    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY

        if (this.selectedTool === "pencil") {
            this.pencilPoints = [{ x: e.clientX, y: e.clientY }];
        }
    }
    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;
        if (selectedTool === "rect") {

            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius,
            }
        } else if (selectedTool === "triangle") {
            shape = {
                type: "triangle",
                x: this.startX,
                y: this.startY,
                width,
                height
            }
        } else if (this.selectedTool === "pencil") {
            if (this.pencilPoints.length > 1) {
                shape = { type: "pencil", points: this.pencilPoints };
            }
        }


        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
        
    }
    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
            const selectedTool = this.selectedTool;
            console.log(selectedTool)
            if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = this.startX + radius;
                const centerY = this.startY + radius;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            if (selectedTool === "triangle") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(this.startX + width, this.startY);
                this.ctx.lineTo(this.startX + width / 2, this.startY + height);
                this.ctx.closePath();
                this.ctx.stroke();
            }
            if (!this.clicked) return;

            if (this.selectedTool === "pencil") {
                this.pencilPoints.push({ x: e.clientX, y: e.clientY });
                this.clearCanvas();
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

        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)

    }

}
