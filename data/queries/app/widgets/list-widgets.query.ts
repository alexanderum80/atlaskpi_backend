import { IAppModels } from './../../../models/app/app-models';
import { IIdentity } from '../../../models/app/identity';
import { IWidgetDocument, IWidgetModel } from '../../../models/app/widgets';
import { QueryBase } from '../../query-base';
import * as Promise from 'bluebird';

export class ListWidgetsQuery extends QueryBase<IWidgetDocument[]> {

    constructor(
            public identity: IIdentity,
            private widgetModel: IWidgetModel) {
                super(identity);
            }

    run(data: any): Promise<IWidgetDocument[]> {
        const that = this;

        return new Promise<IWidgetDocument[]>((resolve, reject) => {
            that.widgetModel
            .find()
            .then(documents => {
                return resolve(documents);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }
}
