import "./styles.scss";
import { CandleChart } from "./core/chart-entity";
import { transformData } from "./utils/transform-data";
import { chartMockedData } from "./data/mocked-data";
import { ApiService } from "./api/api-service";
import { ChartDataChunk } from "./models/chart-data";

const apiService = new ApiService('https://beta.forextester.com');

new CandleChart({
    el: document.getElementById('chart1')!,
    data: transformData(chartMockedData[0]),
    width: 800,
    height: 400
});

function loadChartData(endpoint: string): void {
    apiService.fetchData(endpoint)
        .then((data: ChartDataChunk[]) => {
            new CandleChart({
                el: document.getElementById('chart2')!,
                data: transformData(data[0]),
                width: 800,
                height: 400
            });
        })
        .catch(error => {
            console.error('Error loading chart data:', error);
        });
}

loadChartData('/data/api/Metadata/bars/chunked?Broker=Advanced&Symbol=EURUSD&Timeframe=1&Start=57674&End=59113&UseMessagePack=false');
