import { ConvertedCandleData } from "../models/candle";
import { Candle } from "./candle";
import { ChartDataConfig } from "../models/chart-data";
import { InfoBar } from "./info-bar";
import { DateBar } from "./date-bar";
import { ChartCalculator } from "../utils/chart-calculations";

export class CandleChart {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly canvas: HTMLCanvasElement;
    private readonly width: number;
    private readonly height: number;
    private readonly chartMargin: number = 30;
    private readonly infoBarWidth: number = 80;
    private readonly barGap: number = 2;
    private readonly maxDisplayableBars: number;
    private data: ConvertedCandleData[];
    private displayedBarsCount: number;
    private barWidth: number = 10;
    private viewStart = 0;
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartViewStart: number = 0;
    private infoBar: InfoBar;
    private dateBar: DateBar;

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

        // initialize additional entities
        this.infoBar = new InfoBar(this.data, { width: this.width, height: this.height, chartMargin: this.chartMargin });
        this.dateBar = new DateBar({
            height: this.height,
            barWidth: this.barWidth,
            width: this.width,
            infoBarWidth: this.infoBarWidth
        });

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

    private init(): void {
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
        const prices: number[] = this.data.flatMap((bar: ConvertedCandleData) => [bar.high, bar.low]);
        return ChartCalculator.calculateScaleY(prices, this.height, this.chartMargin);
    }

    private calculateMinPrice() {
        const prices = this.data.flatMap(bar => [bar.high, bar.low]);
        return ChartCalculator.calculateMinPrice(prices);
    }

    private calculateDateDisplayInterval() {
        return ChartCalculator.calculateDateDisplayInterval(this.displayedBarsCount);
    }

    private drawChart() {
        if (!this.ctx) return;

        this.clearCanvas();
        this.drawCandlesAndDates();
        this.drawInfoBar();
    }

    private clearCanvas() {
        this.ctx.clearRect(0, 0, this.width + this.infoBarWidth, this.canvas.height);
    }

    private drawCandlesAndDates() {
        const scaleY = this.calculateScaleY();
        const minPrice = this.calculateMinPrice();

        for (let i = 0; i < this.displayedBarsCount; i++) {
            const barIndex = this.viewStart + i;
            if (barIndex < this.data.length) {
                this.drawCandle(barIndex, i, scaleY, minPrice);
                this.drawDate(barIndex, i);
            }
        }
    }

    private drawCandle(barIndex: number, i: number, scaleY: number, minPrice: number) {
        const bar = this.data[barIndex];
        const x = i * (this.barWidth + this.barGap);
        new Candle(this.ctx, this.barWidth, bar, x, scaleY, minPrice, this.height).draw();
    }

    private drawDate(barIndex: number, i: number) {
        if (barIndex % this.calculateDateDisplayInterval() === 0) {
            const x = i * (this.barWidth + this.barGap);
            this.dateBar.setDate(this.data[barIndex].date);
            this.dateBar.setPositionX(x);
            this.dateBar.draw(this.ctx);
        }
    }

    private drawInfoBar(): void {
        this.infoBar.draw(this.ctx);
    }

    public updateData(newData: ConvertedCandleData[]) {
        this.data = newData;
        this.displayedBarsCount = Math.min(newData.length, this.maxDisplayableBars);
        this.drawChart();
    }
}
