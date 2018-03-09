export enum EnumTopNRecord {
    TOP5 = 'top 5',
    TOP10 = 'top 10',
    TOP15 = 'top 15'
}

export const PredefinedTopNRecords = {
    top5: EnumTopNRecord.TOP5,
    top10: EnumTopNRecord.TOP10,
    top15: EnumTopNRecord.TOP15
};


export interface IChartTopNRecord {
    predefinedNRecord: string;
    customNRecord: number;
}
