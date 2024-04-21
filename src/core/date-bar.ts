import { Bar, DateBarConfig } from "../models/bar";

export class DateBar implements Bar {
    private readonly config: DateBarConfig;
    private date: Date | null = null;
    private positionX: number | null = null;

    constructor(config: DateBarConfig) {
        this.config = config;
    }

    public setDate(date: Date): void {
        this.date = date;
    }

    public setPositionX(positionX: number): void {
        this.positionX = positionX;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.canDraw()) {
            return;
        }

        const { effectiveX, textY } = this.getTextPositions();
        const dateString = this.formatDate(this.date!);

        this.setupContext(ctx);
        this.renderText(ctx, dateString, effectiveX, textY);
    }

    private canDraw(): boolean {
        return this.date !== null && this.positionX !== null;
    }

    private getTextPositions(): { effectiveX: number; textY: number } {
        const effectiveX = this.calculateEffectiveX();
        const textY = this.config.height + 10;
        return { effectiveX, textY };
    }

    private setupContext(ctx: CanvasRenderingContext2D): void {
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'black';
    }

    private renderText(ctx: CanvasRenderingContext2D, text: string, textX: number, textY: number): void {
        if (textX < this.config.width - this.config.infoBarWidth) {
            ctx.fillText(text, textX, textY);
        }
    }

    private calculateEffectiveX(): number {
        const padding = 5;
        return Math.max(this.positionX!, padding);
    }

    private formatDate(date: Date): string {
        const hours = date.getHours();
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const amPm = hours >= 12 ? 'PM' : 'AM';
        const twelveHour = hours % 12 || 12;
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${twelveHour}:${minutes} ${amPm}`;
    }
}