import { ConvertedBarData } from "../models/bar";

export class CandleChart {
    private $el: HTMLElement;
    private data: ConvertedBarData[];
    private readonly width: number;
    private readonly height: number;
    private canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D | null;
    private readonly chartMargin: number;
    private readonly infoBarWidth: number;

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
        this.ctx = this.canvas.getContext('2d');

        this.init();
    }

    private init() {
        this.drawChart();
    }

    private drawChart() {
        if (!this.ctx) return;

        const prices = this.data.flatMap(bar => [bar.high, bar.low]);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const priceRange = maxPrice - minPrice;
        const scaleY = (this.height - this.chartMargin) / priceRange;

        this.ctx.clearRect(0, 0, this.width + this.infoBarWidth, this.canvas.height);
        this.data.forEach((bar, index) => {
            const x = index * (10 + 2); // candle width + gap
            if (x < this.width - 10) {
                this.drawCandle(bar, x, scaleY, minPrice);
            }
        });

        const dateDisplayInterval = Math.ceil(this.data.length / ((this.width - this.infoBarWidth) / 50));
        this.data.forEach((bar, index) => {
            const x = index * (10 + 2); // candle width + gap
            if (index % dateDisplayInterval === 0 && x < (this.width - this.infoBarWidth)) {
                this.drawDate(bar.date, x);
            }
        });

        this.drawInfoBar();
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

        const hours = date.getHours();
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const amPm = hours >= 12 ? 'PM' : 'AM';
        const twelveHour = hours % 12 || 12;

        const dateString = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${twelveHour}:${minutes} ${amPm}`;
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = 'black';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        const textY = this.height + 10;

        this.ctx.fillText(dateString, x + 5, textY);
    }
}
