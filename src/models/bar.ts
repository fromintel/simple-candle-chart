export interface Bar {
    draw(ctx: CanvasRenderingContext2D): void;
}

export interface DateBarConfig {
    height: number;
    barWidth: number;
    width: number;
    infoBarWidth: number;
}
