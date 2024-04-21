export class ChartCalculator {
    static calculateScaleY(prices: number[], height: number, chartMargin: number): number {
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const priceRange = maxPrice - minPrice;
        return (height - chartMargin) / priceRange;
    }

    static calculateMinPrice(prices: number[]): number {
        return Math.min(...prices);
    }

    static calculateDateDisplayInterval(displayedBarsCount: number): number {
        return Math.ceil(displayedBarsCount / 10);
    }
}
