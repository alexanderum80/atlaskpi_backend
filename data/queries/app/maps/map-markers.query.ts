import { IZipToMapModel } from '../../../models/master/zip-to-map/IZipToMap';


import { IIdentity } from '../../../models/app/identity';
import { IQueryResponse } from '../../../models/common';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { ISaleModel, TypeMap } from '../../../models/app/sales/index';
import { QueryBase } from '../../../index';
import { keyBy } from 'lodash';

export interface IMapMarker {
    name: string;
    lat: number;
    lng: number;
    color: string;
    value: number;
}

export class MapMarkersQuery extends QueryBase<IMapMarker[]> {
    constructor(public identity: IIdentity,
                private _SaleModel: ISaleModel,
                private _ZipToMapModel: IZipToMapModel) {
                    super(identity);
                }

    run(data: { type: TypeMap }): Promise<IMapMarker[]> {
        const that = this;

        return new Promise<IMapMarker[]>((resolve, reject) => {
            this._SaleModel.salesBy(data.type).then(salesByZip => {
                // get the zip codes related
                that._ZipToMapModel.find({ zipCode: { $in: salesByZip.map(d => d._id) } })
                    .then(zipList => {
                        // convert array to object
                        const salesObject = keyBy(salesByZip, '_id');

                        const markers = zipList.map(zip => {
                            return {
                                name: zip.zipCode,
                                lat: zip.lat,
                                lng: zip.lng,
                                color: 'green',
                                value: salesObject[zip.zipCode].sales
                            };
                        });

                        resolve(markers);
                    });
                })
                .catch(err => reject(err));
            });
        }
    }
}
