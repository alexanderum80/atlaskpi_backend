import { WidgetFactory } from '../../../models/app/widgets/widget-factory';
import { IUIWidget } from '../../../models/app/widgets/ui-widget-base';
import { IAppModels } from './../../../models/app/app-models';
import { IIdentity } from '../../../models/app/identity';
import { IWidget, IWidgetDocument, IWidgetModel } from '../../../models/app/widgets';
import { QueryBase } from '../../query-base';
import * as Promise from 'bluebird';

export class ListWidgetsQuery extends QueryBase<IUIWidget[]> {

    constructor(
            public identity: IIdentity,
            private ctx: IAppModels) {
                super(identity);
            }

    run(data: any): Promise<IUIWidget[]> {
        const that = this;

        return new Promise<IUIWidget[]>((resolve, reject) => {
            that.ctx.Widget
            .find()
            .then(documents => {
                const uiWidgetsPromises = [];

                documents.forEach(d => {
                    const widgetAsObject = <IWidget>d.toObject();
                    const uiWidget = WidgetFactory.getInstance(widgetAsObject, that.ctx);
                    uiWidgetsPromises.push(uiWidget.materialize());
                });

                Promise.all(uiWidgetsPromises).then(materializedWidgets => {
                    resolve(materializedWidgets);
                })
                .catch(err => reject(err));

            })
            .catch(err => {
                return reject(err);
            });
        });
    }
}
