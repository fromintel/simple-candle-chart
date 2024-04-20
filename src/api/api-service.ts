import { ChartDataChunk } from "../models/chart-data";

export class ApiService {
    constructor(private baseUrl: string = '') {}

    public async fetchData(endpoint: string): Promise<ChartDataChunk[]> {
        const url = this.baseUrl + endpoint;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (e) {
            throw e;
        }
    }
}
