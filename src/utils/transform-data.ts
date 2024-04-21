import { ConvertedCandleData, InitialCandleData } from "../models/candle";
import { ChartDataChunk } from "../models/chart-data";

export function transformData(jsonData: ChartDataChunk): ConvertedCandleData[] {
    const chunkStart = jsonData.ChunkStart * 1000;
    return jsonData.Bars.map((bar: InitialCandleData) => ({
        date: new Date(chunkStart + bar.Time * 1000),
        open: bar.Open,
        high: bar.High,
        low: bar.Low,
        close: bar.Close,
        volume: bar.TickVolume
    }));
}

