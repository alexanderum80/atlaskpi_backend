import { KPIs } from '../domain/app/kpis';
import { Expenses } from '../domain/app/expenses';
import { Sales } from '../domain/app/sales';
import { Charts } from '../domain/app/charts';
import { Widgets } from '../domain/app/widgets/widget.model';
import { WidgetFactory } from '../domain/app/widgets/widget-factory';
import { IUIWidget, IWidget, IWidgetDocument } from '../domain';
import * as Promise from 'bluebird';
import { injectable, inject } from 'inversify';

@injectable()
export class WidgetsService {

    constructor(
        @inject('Widgets') private _widgets: Widgets,
        @inject('Charts') private _charts: Charts,
        @inject('Sales') private _sales: Sales,
        @inject('Expenses') private _expenses: Expenses,
        @inject('KPIs') private _kpis: KPIs,
        @inject(WidgetFactory.name) private _widgetFactory: WidgetFactory
    ) { }

    listWidgets(): Promise<IUIWidget[]> {
        const that = this;

        return new Promise<IUIWidget[]>((resolve, reject) => {
            that._widgets.model
            .find()
            .sort({ size: 1, order: 1, name: 1 })
            .then(documents => {
                that.materializeWidgetDocuments(documents).then(uiWidgets => {
                    resolve(uiWidgets);
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
            const uiWidget = that._widgetFactory.getInstance(data);
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
            that._widgets.model.findOne({ _id: id })
                            .then(widgetDocument => {
                const widgetAsObject = <IWidget>widgetDocument.toObject();
                const uiWidget = that._widgetFactory.getInstance(widgetAsObject);
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

    materializeWidgetDocuments(docs: IWidgetDocument[]): Promise<IUIWidget[]> {
        if (!docs || !docs.length) return Promise.resolve([]);

        const that = this;

        return new Promise<IUIWidget[]>((resolve, reject) => {
            const uiWidgetsPromises = [];

            docs.forEach(d => {
                const widgetAsObject = <IWidget>d.toObject();
                const uiWidget = that._widgetFactory.getInstance(widgetAsObject);
                uiWidgetsPromises.push(uiWidget.materialize());
            });

            Promise.all(uiWidgetsPromises).then(materializedWidgets => {
                resolve(materializedWidgets);
                return;
            })
            .catch(err => reject(err));
        });
    }
}