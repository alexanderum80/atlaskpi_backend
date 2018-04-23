import { inject, injectable } from 'inversify';
import { chain, Dictionary, isEmpty, keyBy } from 'lodash';

import { ISaleByZip, TypeMap } from '../../../domain/app/sales/sale';
import { Sales } from '../../../domain/app/sales/sale.model';
import { IZipToMapDocument } from '../../../domain/master/zip-to-map/zip-to-map';
import { ZipsToMap } from '../../../domain/master/zip-to-map/zip-to-map.model';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { NULL_CATEGORY_REPLACEMENT } from '../../charts/queries/charts/ui-chart-base';
import { GetMapDetailsActivity } from '../activities/get-map-details.activity';
import { MapMarker, MapMarkerGroupingInput, MapMarkerItemList } from '../map.types';

export interface IMapMarker {
    name: string;
    lat: number;
    lng: number;
    color: string;
    value: number;
}

@injectable()
@query({
    name: 'mapMarkers',
    activity: GetMapDetailsActivity,
    parameters: [
        { name: 'type', type: GraphQLTypesMap.String },
        { name: 'input', type: MapMarkerGroupingInput }
    ],
    output: { type: MapMarker, isArray: true }
})
export class MapMarkersQuery implements IQuery < IMapMarker[] > {
    constructor(
        @inject(Sales.name) private _sales: Sales,
        @inject(ZipsToMap.name) private _ZipToMaps: ZipsToMap) { }

    async run(data: { type: TypeMap, input: MapMarkerGroupingInput }): Promise < IMapMarker[] > {
        const salesByZip = await this._sales.model.salesBy(data.type, data.input);
        // get the zip codes related
        const zipList = await this._ZipToMaps.model.find({
                            zipCode: {
                                $in: salesByZip.map(d => d._id.customerZip)
                            }});

        // convert array to object
        let markers;

        if (data.input) {
            if (data.input['grouping']) {
                markers = this._groupingMarkersFormatted(salesByZip, zipList);
            } else {
                markers = this._noGroupingsMarkersFormatted(salesByZip, zipList);
            }
        } else {
            markers = this._noGroupingsMarkersFormatted(salesByZip, zipList);
        }

        return markers;
    }

    private _noGroupingsMarkersFormatted(salesByZip: ISaleByZip[], zipList: IZipToMapDocument[]): MapMarker[] {
        const salesObject: Dictionary<ISaleByZip> = keyBy(salesByZip, '_id.customerZip');

        return zipList.map(zip => {
            return {
                name: zip.zipCode,
                lat: zip.lat,
                lng: zip.lng,
                color: getMarkerColor(salesObject[zip.zipCode].sales),
                value: salesObject[zip.zipCode].sales,
                groupingName: salesObject[zip.zipCode]._id['grouping']
            };
        });
    }

    private _groupingMarkersFormatted(salesByZip: ISaleByZip[], zipList: IZipToMapDocument[]): MapMarker[] {
        const zipCodes: Dictionary<IZipToMapDocument> = keyBy(zipList, 'zipCode');

        return chain(salesByZip)
                    .groupBy('_id.customerZip')
                    // key = zipCode => i.e. 37703
                    .map((value: ISaleByZip[], key: string) => {
                        let itemList: MapMarkerItemList[] = [];
                        let total: number = 0;

                        for (let i = 0; i < value.length; i++) {
                            if (value[i]) {
                                const groupName: string = (value[i]._id as any).grouping ||
                                                          NULL_CATEGORY_REPLACEMENT;
                                const amount: number = value[i].sales;

                                total += amount;

                                itemList.push({
                                    amount: amount, // 50000
                                    groupName: groupName // i.e. Knoxville
                                });
                            }
                        }

                        if (key && zipCodes[key]) {
                            return {
                                name: key,
                                lat: zipCodes[key].lat,
                                lng: zipCodes[key].lng,
                                color: getMarkerColor(total),
                                value: total,
                                itemList: itemList
                            };
                        }
                    })
                    .filter(items => {
                        return !isEmpty(items);
                    })
                    .value();
    }


}

export enum MarkerColorEnum {
    // Black = 'black',
    Purple = 'purple',
    Red = 'red',
    Blue = 'blue',
    Green = 'green',
    Yellow = 'yellow',
    Navy = 'navy'
}

export const SalesColorMap = {
    yellow: { min: 0, max: 50000 },
    blue: { min: 50001, max: 250000 },
    green: { min: 250001, max: 500000 },
    navy: { min: 500001, max: 1000000 },
    red: { min: 1000001, max: 5000000 },
    purple: { min: 5000001, max: 5000000000 },
};

function getMarkerColor(sales: number): MarkerColorEnum {
    const colors = Object.keys(SalesColorMap);
    return colors.find(c => sales >= SalesColorMap[c].min && sales <= SalesColorMap[c].max) as MarkerColorEnum;
}