import { ConvertedBarData } from "../models/bar";

export class CandleChart {
    private readonly data: ConvertedBarData[];
    private readonly width: number;
    private readonly height: number;
    private readonly ctx: CanvasRenderingContext2D | null;
    private readonly chartMargin: number;
    private readonly infoBarWidth: number;
    private readonly displayedBarsCount: number;
    private readonly maxDisplayableBars: number;
    private $el: HTMLElement;
    private canvas: HTMLCanvasElement;
    private barWidth: number = 10;
    private barGap: number = 2;
    private viewStart = 0;

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

        for (let i = 0; i < this.displayedBarsCount; i++) {
            const barIndex = this.viewStart + i;
            if (barIndex < this.data.length) {
                const bar = this.data[barIndex];
                const x = i * (this.barWidth + this.barGap);
                this.drawCandle(bar, x, scaleY, minPrice);
            }
        }

        const dateDisplayInterval = Math.ceil(this.data.length / ((this.width - this.infoBarWidth) / 50));
        for (let i = this.viewStart; i < this.viewStart + this.displayedBarsCount; i++) {
            if (i < this.data.length) {
                const bar = this.data[i];
                const x = (i - this.viewStart) * (this.barWidth + this.barGap);
                this.drawCandle(bar, x, scaleY, minPrice);

                if ((i - this.viewStart) % dateDisplayInterval === 0) {
                    this.drawDate(bar.date, i);
                }
            }
        }

        this.drawInfoBar();
    }

    private handleScroll(event: WheelEvent) {
        event.preventDefault();
        const direction = event.deltaY > 0 ? 1 : -1;
        this.viewStart += direction;

        this.viewStart = Math.max(0, Math.min(this.viewStart, this.data.length - this.displayedBarsCount));
        this.drawChart();
    }

    private drawCandle(bar: ConvertedBarData, x: number, scaleY: number, minPrice: number) {
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

    private drawDate(date: Date, index: number) {
        if (!this.ctx) return;

        const adjustedX = (index - this.viewStart) * (this.barWidth + this.barGap);

        if (adjustedX >= 0 && adjustedX < (this.width - this.infoBarWidth)) {
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
            this.ctx.fillText(dateString, adjustedX + this.barWidth / 2, textY);
        }
    }
}
