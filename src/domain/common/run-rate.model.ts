import { Entity } from './entity';

export interface ChartRunRates extends Entity {
    name: string,
    description: string,
    chart: string,
    startingFrom: string,
    periodPredict: string,
    title: string,
    frequency: string
}