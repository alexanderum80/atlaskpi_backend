import { QueryBase } from '../../query-base';
import { IAppModels } from '../../../models/app/app-models';
import { IIdentity } from '../../../models/app/identity';
import { IChartModel, IChartDocument } from '../../../models/app/charts';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
// import { ChartProcessor } from './chart-processor';


export class GetChartsGroupQuery extends QueryBase<string[]> {
        constructor(
            public identity: IIdentity,
            private _ctx: IAppModels) {
                super(identity);
            }
        run(data: any): Promise<string[]> {
            const that = this;

            return new Promise<string[]>((resolve, reject) => {
                this._ctx.Chart.find({}).then(charts => {
                    // let result: string[] = [];
                    let groups: string[] = [];

                    let uniqGroup: string[] = [];

                    _.each(charts, collection => {
                        let group = collection.group;
                        if (group && uniqGroup.indexOf(group) === -1) {
                            uniqGroup.push(group);
                        }

                        // Object.keys(collection).forEach(key => {
                        //     uniqGroup[key] = collection.group[key];
                        // });
                    });

                    // result.push(uniqGroup);

                    // uniqGroup.forEach((g, a) => {
                    //         let group = uniqGroup[a];

                    //         if (group && result.indexOf(g) === -1) {
                    //             result.push(uniqGroup[g]);
                    //         }
                    //     });
                    // return uniqGroup;
                    resolve(<any>JSON.stringify(uniqGroup));

                    // Promise.all(uniqGroup).then((charts) => {
                    //     let response = {};
                    //     Object.assign(responsxe, { data: charts });
                    //     resolve(<any>JSON.stringify(response));
                    // });
                })
                .catch(err => {
                    reject('There was an error retrieving chart');
                });
            });
        }
    }