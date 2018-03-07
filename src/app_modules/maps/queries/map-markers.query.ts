import { IZipToMapDocument } from '../../../domain/master/zip-to-map/zip-to-map';
import { GroupingMap } from '../../charts/queries/chart-grouping-map';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { GetMapDetailsActivity } from '../activities/get-map-details.activity';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Sales } from '../../../domain/app/sales/sale.model';
import { ZipsToMap } from '../../../domain/master/zip-to-map/zip-to-map.model';
import { ISaleByZip, TypeMap } from '../../../domain/app/sales/sale';
import { keyBy, find, startCase, toLower, groupBy, map, chain, reduce, isEmpty } from 'lodash';
import {MapMarker, MapMarkerGroupingInput} from '../map.types';
import {NULL_CATEGORY_REPLACEMENT} from '../../charts/queries/charts/ui-chart-base';

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

    run(data: {
        type: TypeMap,
        input: MapMarkerGroupingInput
    }): Promise < IMapMarker[] > {
        const that = this;

        return new Promise < IMapMarker[] > ((resolve, reject) => {
            this._sales.model.salesBy(data.type, data.input).then(salesByZip => {
                    // get the zip codes related
                    that._ZipToMaps.model.find({
                            zipCode: {
                                $in: salesByZip.map(d => d._id.customerZip)
                            }
                        })
                        .then(zipList => {
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

                             resolve(markers);
                        });
                })
                .catch(err => reject(err));
        });
    }

    private _noGroupingsMarkersFormatted(salesByZip: ISaleByZip[], zipList: IZipToMapDocument[]) {
        const salesObject = keyBy(salesByZip, '_id.customerZip');
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

    private _groupingMarkersFormatted(salesByZip: ISaleByZip[], zipList: IZipToMapDocument[]): any {
        const zipCodes = keyBy(zipList, 'zipCode');

        return chain(salesByZip)
                    .groupBy('_id.customerZip')
                    .map((value, key) => {
                        let itemList = [];
                        let total = 0;

                        for (let i = 0; i < value.length; i++) {
                            if (value[i]) {
                                const groupName = (value[i]._id as any).grouping || NULL_CATEGORY_REPLACEMENT;
                                const amount = value[i].sales;

                                total += amount;

                                itemList.push({
                                    amount: amount,
                                    groupName: groupName
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