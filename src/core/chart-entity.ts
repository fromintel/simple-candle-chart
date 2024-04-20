import { ConvertedBarData } from "../models/bar";
import { Candle } from "./candle";

export class CandleChart {
    private readonly width: number;
    private readonly height: number;
    private readonly ctx: CanvasRenderingContext2D | null;
    private readonly chartMargin: number;
    private readonly infoBarWidth: number;
    private readonly maxDisplayableBars: number;
    private data: ConvertedBarData[];
    private displayedBarsCount: number;
    private $el: HTMLElement;
    private canvas: HTMLCanvasElement;
    private barWidth: number = 10;
    private barGap: number = 2;
    private viewStart = 0;
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartViewStart: number = 0;

    constructor(options: { el: HTMLElement, data: ConvertedBarData[], width?: number, height?: number, animationSpeed?: number }) {
        if (!options.el) throw new Error('[Candle Chart]: "el" option must be provided');
        if (!options.data) throw new Error('[Candle Chart]: "data" option must be provided');

        this.$el = options.el;
        this.data = options.data;
        this.width = options.width || 800;
        this.height = options.height || 400;

        this.$el.innerHTML = '<canvas></canvas>';
        this.canvas = this.$el.querySelector('canvas')!;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.chartMargin = 30;
        this.infoBarWidth = 80;
        this.canvas.width += this.infoBarWidth;
        this.canvas.height = this.height + this.chartMargin;

        this.maxDisplayableBars = Math.floor((this.width - this.infoBarWidth) / (this.barWidth + this.barGap));
        this.displayedBarsCount = Math.min(options.data.length, this.maxDisplayableBars);

        this.canvas.addEventListener('wheel', (event) => {
            this.handleScroll(event);
        });

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        this.ctx = this.canvas.getContext('2d');

        this.init();
    }

    private init() {
        this.drawChart();
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

        const scaleY = this.calculateScaleY();
        const minPrice = this.calculateMinPrice();

        this.ctx.clearRect(0, 0, this.width + this.infoBarWidth, this.canvas.height);

        for (let i = 0; i < this.displayedBarsCount; i++) {
            const barIndex = this.viewStart + i;
            if (barIndex < this.data.length) {
                const bar = this.data[barIndex];
                const x = i * (this.barWidth + this.barGap);
                new Candle(this.ctx, this.barWidth, bar, x, scaleY, minPrice, this.height).draw();

                if (barIndex % this.calculateDateDisplayInterval() === 0) {
                    this.drawDate(bar.date, x);
                }
            }
        }

        this.drawInfoBar();
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

    private drawDate(date: Date, x: number) {
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
