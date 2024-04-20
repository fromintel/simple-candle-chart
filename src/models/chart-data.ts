import { InitialBarData } from "./bar";

export interface ChartDataChunk {
    ChunkStart: number;
    Bars: InitialBarData[];
}
