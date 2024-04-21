import { ChartDataConfig } from "../models/chart-data";
import { CandleChartRenderer } from "../features/chart-renderer";
import { CandleChartController } from "../features/chart-controller";

export class CandleChart {
    private readonly renderer: CandleChartRenderer;
    private readonly canvas: HTMLCanvasElement;

    constructor(options: ChartDataConfig) {
        this.canvas = this.initializeCanvas(options.el, options.width, options.height);
        this.renderer = new CandleChartRenderer(this.canvas.getContext('2d')!, options);
        new CandleChartController(this.renderer, this.canvas);
    }

    /**
     * @param el The parent HTML element to host the canvas.
     * @param width Optional width for the canvas. Defaults to 800.
     * @param height Optional height for the canvas. Defaults to 400.
     * @returns The initialized canvas element.
     */
    private initializeCanvas(el: HTMLElement, width?: number, height?: number): HTMLCanvasElement {
        el.innerHTML = '<canvas></canvas>';
        const canvas: HTMLCanvasElement = el.querySelector('canvas')!;
        canvas.width = (width || 800) + 80;
        canvas.height = (height || 400) + 30;
        return canvas;
    }
}
