import { ConvertedBarData } from "../models/bar";
import { Candle } from "./candle";
import { ChartDataConfig } from "../models/chart-data";

export class CandleChart {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly canvas: HTMLCanvasElement;
    private readonly width: number;
    private readonly height: number;
    private readonly chartMargin: number = 30;
    private readonly infoBarWidth: number = 80;
    private readonly barGap: number = 2;
    private readonly maxDisplayableBars: number;
    private data: ConvertedBarData[];
    private displayedBarsCount: number;
    private barWidth: number = 10;
    private viewStart = 0;
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartViewStart: number = 0;

    constructor(options: ChartDataConfig) {
        this.validateOptions(options);
        this.data = options.data;
        this.width = options.width || 800;
        this.height = options.height || 400;

        // Element initialization
        this.canvas = this.initializeCanvas(options.el);
        this.ctx = this.canvas.getContext('2d')!;

        // Setup dimensions based on current data and options
        this.maxDisplayableBars = Math.floor((this.width - this.infoBarWidth) / (this.barWidth + this.barGap));
        this.displayedBarsCount = Math.min(this.data.length, this.maxDisplayableBars);

        // Attach event listeners
        this.attachEventListeners();

        // Initial draw of the chart
        this.init();
    }

    private validateOptions(options: ChartDataConfig): void {
        if (!options.el) throw new Error('[Candle Chart]: "el" option must be provided');
        if (!options.data) throw new Error('[Candle Chart]: "data" option must be provided');
    }

    private initializeCanvas(el: HTMLElement): HTMLCanvasElement {
        el.innerHTML = '<canvas></canvas>';
        const canvas = el.querySelector('canvas')!;
        canvas.width = this.width + this.infoBarWidth;
        canvas.height = this.height + this.chartMargin;
        return canvas;
    }

    private init() {
        this.drawChart();
    }

    private attachEventListeners(): void {
        this.canvas.addEventListener('wheel', this.handleScroll.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    }

    private handleMouseDown(event: MouseEvent) {
        this.isDragging = true;
        this.dragStartX = event.clientX;
        this.dragStartViewStart = this.viewStart;
    }

    private handleMouseMove(event: MouseEvent) {
        if (this.isDragging) {
            const dx = event.clientX - this.dragStartX;
            // Convert dx in pixels to dx in bars (reverse direction for natural drag effect)
            const dxInBars = -Math.floor(dx / (this.barWidth + this.barGap));
            this.viewStart = Math.max(0, Math.min(this.dragStartViewStart + dxInBars, this.data.length - this.displayedBarsCount));
            this.drawChart();
        }
    }

    private handleMouseUp() {
        this.isDragging = false;
    }

    private handleScroll(event: WheelEvent) {
        if (event.deltaX !== 0) return;

        event.preventDefault();
        const zoomIntensity = 1;

        const newDisplayedBarsCount = this.displayedBarsCount - event.deltaY / Math.abs(event.deltaY) * zoomIntensity;

        const minBarsToShow = 10;
        const maxBarsToShow = 60;

        this.displayedBarsCount = Math.max(
            minBarsToShow,
            Math.min(newDisplayedBarsCount, maxBarsToShow)
        );

        this.barWidth = (this.width - this.infoBarWidth) / this.displayedBarsCount - this.barGap;

        this.drawChart();
    }

    private calculateScaleY() {
        const prices = this.data.flatMap(bar => [bar.high, bar.low]);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const priceRange = maxPrice - minPrice;
        return (this.height - this.chartMargin) / priceRange;
    }

    private calculateMinPrice() {
        const prices = this.data.flatMap(bar => [bar.high, bar.low]);
        return Math.min(...prices);
    }

    private calculateDateDisplayInterval() {
        return Math.ceil(this.displayedBarsCount / 10);
    }

    private drawChart() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.width + this.infoBarWidth, this.canvas.height);

        this.drawDatesBar()
        this.drawInfoBar();
    }

    private drawInfoBar() {
        if (!this.ctx) {
            return;
        }

        this.ctx.fillStyle = 'rgba(245, 245, 245, 0.8)';
        this.ctx.fillRect(this.width, 0, this.infoBarWidth, this.height);

        this.data.forEach((bar, index) => {
            const textX = this.width + 5;
            const textY = index * 15 + this.chartMargin;

            if (textY + 15 <= this.height && this.ctx) {
                this.ctx.textAlign = 'left';
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(`${bar.open.toFixed(5)}`, textX, textY);
            }
        });
    }

    private drawDatesBar(): void {
        const scaleY = this.calculateScaleY();
        const minPrice = this.calculateMinPrice();

        for (let i = 0; i < this.displayedBarsCount; i++) {
            const barIndex = this.viewStart + i;
            if (barIndex < this.data.length) {
                const bar = this.data[barIndex];
                const x = i * (this.barWidth + this.barGap);
                new Candle(this.ctx, this.barWidth, bar, x, scaleY, minPrice, this.height).draw();

                if (barIndex % this.calculateDateDisplayInterval() === 0) {
                    this.drawDateItem(bar.date, x);
                }
            }
        }
    }

    private drawDateItem(date: Date, x: number) {
        if (!this.ctx) return;

        const padding = 5;
        const effectiveX = Math.max(x, padding);

        const dateString = this.formatDate(date);
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = 'black';

        const textY = this.height + 10;

        if (effectiveX + this.barWidth / 2 < this.width - this.infoBarWidth) {
            this.ctx.fillText(dateString, effectiveX + this.barWidth / 2, textY);
        }
    }

    private formatDate(date: Date): string {
        const hours = date.getHours();
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const amPm = hours >= 12 ? 'PM' : 'AM';
        const twelveHour = hours % 12 || 12;
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${twelveHour}:${minutes} ${amPm}`;
    }

    public updateData(newData: ConvertedBarData[]) {
        this.data = newData;
        this.displayedBarsCount = Math.min(newData.length, this.maxDisplayableBars);
        this.drawChart();
    }
}
