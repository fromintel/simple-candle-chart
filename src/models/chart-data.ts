import { ConvertedCandleData, InitialCandleData } from "./candle";

export interface ChartDataChunk {
    ChunkStart: number;
    Bars: InitialCandleData[];
}

export interface ChartDataConfig {
    el: HTMLElement,
    data: ConvertedCandleData[],
    width?: number,
    height?: number,
    animationSpeed?: number
}
