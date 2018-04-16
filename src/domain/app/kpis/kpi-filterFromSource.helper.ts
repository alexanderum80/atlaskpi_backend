import { IKPIFilter, KPITypeEnum, IKPISimpleDefinition } from './kpi';


export class KPIFilterFromSourceHelper {
    
    public static ComposeFilter(source: string): any {

        if (!source) { return null; }
        const arraySource = source.split('|').map(t => t);
        let oper
        if (arraySource.length > 1) {
            oper = 'in';
            return KPIFilterFromSourceHelper._convertMongoSource(oper, arraySource);
        }else{
            const sourceValue = source;
            oper = 'eq'
            return KPIFilterFromSourceHelper._convertMongoSource(oper, sourceValue);
        }
    }
    
    public static _convertMongoSource(oper: string, valueSource: any){
        let sourceFilter = {};
        sourceFilter ['source'] = {};
        sourceFilter ['source']['__dollar__' + oper] = valueSource;
        return sourceFilter;
    }

    public static _concatAllFilters(inputFilters: string[], valueSourceFilter) {
        let allSourceFilters: string[] = [];
        let getAllFilters;
        getAllFilters = allSourceFilters.concat(inputFilters, valueSourceFilter);
        return getAllFilters ;
    }
}