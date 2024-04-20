import { ConvertedBarData } from "../models/bar";

export class CandleChart {
    private $el: HTMLElement;
    private data: ConvertedBarData[];
    private readonly width: number;
    private readonly height: number;
    private canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D | null;

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
        this.ctx = this.canvas.getContext('2d');

        this.init();
    }

    private init() {
        this.drawChart();
    }

    private drawChart() {
        if (!this.ctx) return;

        // Determining the maximum and minimum values for scaling
        const prices = this.data.flatMap(bar => [bar.high, bar.low]);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const priceRange = maxPrice - minPrice;

        // Calculate the scaling factor
        const scaleY = this.height / priceRange;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.data.forEach((bar, index) => {
            const x = index * (10 + 2);  // candle width + gap
            this.drawCandle(bar, x, scaleY, minPrice);
        });
    }

    private drawCandle(bar: ConvertedBarData, x: number, scaleY: number, minPrice: number) {
        // Recalculate Y coordinates to scale
        const yHigh = (bar.high - minPrice) * scaleY;
        const yLow = (bar.low - minPrice) * scaleY;
        const yOpen = (bar.open - minPrice) * scaleY;
        const yClose = (bar.close - minPrice) * scaleY;

        if (!this.ctx) {
            return;
        }

        // High-Low line drawing
        this.ctx.beginPath();
        this.ctx.moveTo(x + 5, this.height - yHigh);
        this.ctx.lineTo(x + 5, this.height - yLow);
        this.ctx.stroke();

        // Drawing an Open-Close rectangle
        this.ctx.fillStyle = bar.open > bar.close ? 'red' : 'green';
        this.ctx.fillRect(x, this.height - Math.max(yOpen, yClose), 10, Math.abs(yOpen - yClose));
    }
}
