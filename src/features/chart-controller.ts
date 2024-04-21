import { CandleChartRenderer } from "./chart-renderer";

export class CandleChartController {
    private renderer: CandleChartRenderer;
    private canvas: HTMLCanvasElement;
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private viewStart: number = 0;
    private dragStartViewStart: number = 0;

    constructor(renderer: CandleChartRenderer, canvas: HTMLCanvasElement) {
        this.renderer = renderer;
        this.canvas = canvas;
        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        this.canvas.addEventListener('wheel', this.handleScroll.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    }

    private handleMouseDown(event: MouseEvent): void {
        this.isDragging = true;
        this.dragStartX = event.clientX;
        this.dragStartViewStart = this.renderer.getViewStart();
    }

    private handleMouseMove(event: MouseEvent): void {
        if (this.isDragging) {
            const dx = event.clientX - this.dragStartX;
            const dxInBars = -Math.floor(dx / (this.renderer.getBarWidth() + this.renderer.getBarGap()));
            this.viewStart = Math.max(0, Math.min(this.dragStartViewStart + dxInBars, this.renderer.getDataLength() - this.renderer.getDisplayedBarsCount()));
            this.renderer.setViewStart(this.viewStart);
            this.renderer.drawChart();
        }
    }

    private handleMouseUp(): void {
        this.isDragging = false;
    }

    private handleScroll(event: WheelEvent): void {
        if (event.deltaX !== 0) return;

        event.preventDefault();
        this.renderer.adjustZoom(event.deltaY);
        this.renderer.drawChart();
    }
}
