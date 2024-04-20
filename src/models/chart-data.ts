import { ConvertedBarData, InitialBarData } from "./bar";

export interface ChartDataChunk {
    ChunkStart: number;
    Bars: InitialBarData[];
}

export interface ChartDataConfig {
    el: HTMLElement,
    data: ConvertedBarData[],
    width?: number,
    height?: number,
    animationSpeed?: number
}
