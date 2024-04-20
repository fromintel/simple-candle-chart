import { ConvertedBarData, InitialBarData } from "../models/bar";
import { ChartDataChunk } from "../models/chart-data";

export function transformData(jsonData: ChartDataChunk): ConvertedBarData[] {
    const chunkStart = jsonData.ChunkStart * 1000;
    return jsonData.Bars.map((bar: InitialBarData) => ({
        date: new Date(chunkStart + bar.Time * 1000),
        open: bar.Open,
        high: bar.High,
        low: bar.Low,
        close: bar.Close,
        volume: bar.TickVolume
    }));
}

