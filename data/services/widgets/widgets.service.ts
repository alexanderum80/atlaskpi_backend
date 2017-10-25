import { WidgetFactory } from './../../models/app/widgets/widget-factory';
import { IWidget } from './../../models/app/widgets/IWidget';
import { IUIWidget } from './../../models/app/widgets/ui-widget-base';
import { IAppModels } from './../../models/app/app-models';
import * as Promise from 'bluebird';

export class WidgetsService {

    constructor(private _ctx: IAppModels) { }

    listWidgets(): Promise<IUIWidget[]> {
        const that = this;

        return new Promise<IUIWidget[]>((resolve, reject) => {
            that._ctx.Widget
            .find()
            .sort({ order: 1, name: 1 })
            .then(documents => {
                const uiWidgetsPromises = [];

                documents.forEach(d => {
                    const widgetAsObject = <IWidget>d.toObject();
                    const uiWidget = WidgetFactory.getInstance(widgetAsObject, that._ctx);
                    uiWidgetsPromises.push(uiWidget.materialize());
                });

                Promise.all(uiWidgetsPromises).then(materializedWidgets => {
                    resolve(materializedWidgets);
                    return;
                })
                .catch(err => reject(err));

            })
            .catch(err => {
                return reject(err);
            });
        });
    }

    previewWidget(data: IWidget): Promise<IUIWidget> {
        const that = this;
        return new Promise<IUIWidget>((resolve, reject) => {
            const uiWidget = WidgetFactory.getInstance(data, that._ctx);
            uiWidget.materialize().then(materializedWidget => {
                resolve(materializedWidget);
                return;
            })
            .catch(err => {
                console.log('error when previewing the widget: ' + err);
                return reject(err);
            });
        });
    }

    getWidgetById(id: string): Promise<IUIWidget> {
        const that = this;
        return new Promise<IUIWidget>((resolve, reject) => {
            that._ctx.Widget.findOne({ _id: id })
                            .then(widgetDocument => {
                const widgetAsObject = <IWidget>widgetDocument.toObject();
                const uiWidget = WidgetFactory.getInstance(widgetAsObject, that._ctx);
                uiWidget.materialize().then(materializedWidget => {
                    resolve(materializedWidget);
                    return;
                })
                .catch(err => {
                    console.log(`error when getting the widget(${id}):  ${err}`);
                    return reject(err);
                });
            })
            .catch(err => reject(err));
        });
    }

}