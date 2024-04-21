import { ConvertedCandleData } from "../models/candle";

export class Candle {
    private ctx: CanvasRenderingContext2D;
    private readonly barWidth: number;
    private readonly color: string;
    private readonly high: number;
    private readonly low: number;
    private readonly open: number;
    private readonly close: number;
    private readonly xPosition: number;
    private readonly scaleY: number;
    private readonly minPrice: number;
    private readonly chartHeight: number;

    constructor(
        ctx: CanvasRenderingContext2D,
        barWidth: number,
        data: ConvertedCandleData,
        xPosition: number,
        scaleY: number,
        minPrice: number,
        chartHeight: number
    ) {
        this.ctx = ctx;
        this.barWidth = barWidth;
        this.high = data.high;
        this.low = data.low;
        this.open = data.open;
        this.close = data.close;
        this.xPosition = xPosition;
        this.scaleY = scaleY;
        this.minPrice = minPrice;
        this.chartHeight = chartHeight;
        this.color = this.open > this.close ? 'red' : 'green';
    }

    public draw(): void {
        this.drawHighLowLine();
        this.drawOpenCloseRectangle();
    }

    private drawHighLowLine(): void {
        const yHigh: number = this.calculateAdjustedY(this.high);
        const yLow: number = this.calculateAdjustedY(this.low);
        this.ctx.beginPath();
        this.ctx.moveTo(this.xPosition + this.barWidth / 2, yHigh);
        this.ctx.lineTo(this.xPosition + this.barWidth / 2, yLow);
        this.ctx.stroke();
    }

    private drawOpenCloseRectangle(): void {
        const yOpen = this.calculateAdjustedY(this.open);
        const yClose = this.calculateAdjustedY(this.close);
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.xPosition, Math.min(yOpen, yClose), this.barWidth, Math.abs(yOpen - yClose));
    }

    private calculateAdjustedY(price: number): number {
        return this.chartHeight - (price - this.minPrice) * this.scaleY;
    }
}
