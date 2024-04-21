import { Bar } from "../models/bar";
import { ConvertedCandleData } from "../models/candle";

export class InfoBar implements Bar {
    private data: ConvertedCandleData[];
    private readonly width: number;
    private readonly height: number;
    private readonly chartMargin: number;
    private readonly infoBarWidth: number = 80;

    constructor(data: ConvertedCandleData[], config: { width: number, height: number, chartMargin: number }) {
        this.data = data;
        this.width = config.width;
        this.height = config.height;
        this.chartMargin = config.chartMargin;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.prepareBackground(ctx);
        this.drawInfoText(ctx);
    }

    private prepareBackground(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'rgba(245, 245, 245, 0.8)';
        ctx.fillRect(this.width, 0, this.infoBarWidth, this.height);
    }

    private drawInfoText(ctx: CanvasRenderingContext2D): void {
        ctx.textAlign = 'left';
        ctx.fillStyle = 'black';

        this.data.forEach((bar, index) => {
            const { textX, textY } = this.calculateTextPosition(index);
            if (this.isPositionInBounds(textY)) {
                ctx.fillText(`${bar.open.toFixed(5)}`, textX, textY);
            }
        });
    }

    private calculateTextPosition(index: number): {textX: number, textY: number} {
        const textX = this.width + 5;
        const textY = index * 15 + this.chartMargin;
        return { textX, textY };
    }

    private isPositionInBounds(textY: number): boolean {
        return textY + 15 <= this.height;
    }
}
