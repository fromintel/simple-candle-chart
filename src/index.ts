import "./styles.scss";
import { CandleChart } from "./core/chart-entity";
import { transformData } from "./utils/transform-data";
import { chartMockedData } from "./data/mocked-data";

new CandleChart({
    el: document.getElementById('chart1')!,
    data: transformData(chartMockedData[0]),
    width: 800,
    height: 400
});
