import { ConvertedCandleData } from "../models/candle";
import { ChartDataConfig } from "../models/chart-data";
import { ChartCalculator } from "../utils/chart-calculations";
import { InfoBar } from "../core/info-bar";
import { DateBar } from "../core/date-bar";
import { Candle } from "../core/candle";
import { Bar } from "../models/bar";

export class CandleChartRenderer {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly width: number;
    private readonly height: number;
    private readonly chartMargin: number = 30;
    private readonly infoBarWidth: number = 80;
    private readonly barGap: number = 2;
    private readonly data: ConvertedCandleData[];
    private readonly maxDisplayableBars: number;
    private displayedBarsCount: number;
    private barWidth: number = 10;
    private viewStart: number = 0;
    private infoBar!: Bar;
    private dateBar!: DateBar;

    constructor(ctx: CanvasRenderingContext2D, options: ChartDataConfig) {
        this.ctx = ctx;
        this.data = options.data;
        this.width = options.width || 800;
        this.height = options.height || 400;
        this.maxDisplayableBars = this.calculateMaxDisplayableBars();
        this.displayedBarsCount = Math.min(this.data.length, this.maxDisplayableBars);
        this.initializeComponents();
        this.drawChart();
    }

    private calculateMaxDisplayableBars(): number {
        return Math.floor((this.width - this.infoBarWidth) / (this.barWidth + this.barGap));
    }

    private initializeComponents(): void {
        this.infoBar = new InfoBar(this.data, {
            width: this.width,
            height: this.height,
            chartMargin: this.chartMargin
        });
        this.dateBar = new DateBar({
            height: this.height,
            barWidth: this.barWidth,
            width: this.width,
            infoBarWidth: this.infoBarWidth
        });
    }

    public drawChart(): void {
        if (!this.ctx) return;

        this.clearCanvas();

        this.drawCandlesAndDates();
        this.drawInfoBar();
    }

    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.width + this.infoBarWidth, this.height + this.chartMargin);
    }

    private drawCandlesAndDates(): void {
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

    private drawCandle(barIndex: number, index: number, scaleY: number, minPrice: number): void {
        const bar = this.data[barIndex];
        const xPosition = index * (this.barWidth + this.barGap);
        new Candle(this.ctx, this.barWidth, bar, xPosition, scaleY, minPrice, this.height).draw();
    }

    private drawDate(barIndex: number, i: number): void {
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

    private calculateScaleY(): number {
        const prices: number[] = this.data.flatMap((bar: ConvertedCandleData) => [bar.high, bar.low]);
        return ChartCalculator.calculateScaleY(prices, this.height, this.chartMargin);
    }

    private calculateMinPrice(): number {
        const prices = this.data.flatMap(bar => [bar.high, bar.low]);
        return ChartCalculator.calculateMinPrice(prices);
    }

    private calculateDateDisplayInterval(): number {
        return ChartCalculator.calculateDateDisplayInterval(this.displayedBarsCount);
    }

    public adjustZoom(deltaY: number): void {
        const zoomIntensity = 1;
        const newDisplayedBarsCount = this.displayedBarsCount - deltaY / Math.abs(deltaY) * zoomIntensity;
        const minBarsToShow = 10;
        const maxBarsToShow = 60;
        this.displayedBarsCount = Math.max(minBarsToShow, Math.min(newDisplayedBarsCount, maxBarsToShow));
        this.barWidth = (this.width - this.infoBarWidth) / this.displayedBarsCount - this.barGap;
    }

    public setViewStart(start: number): void {
        this.viewStart = start;
    }

    public get getViewStart(): number {
        return this.viewStart;
    }

    public get getBarWidth(): number {
        return this.barWidth;
    }

    public get getBarGap(): number {
        return this.barGap;
    }

    public get getDataLength(): number {
        return this.data.length;
    }

    public get getDisplayedBarsCount(): number {
        return this.displayedBarsCount;
    }
}
