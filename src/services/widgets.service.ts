import { inject, injectable } from 'inversify';

import { Charts } from '../domain/app/charts/chart.model';
import { Dashboards } from '../domain/app/dashboards/dashboard.model';
import { Expenses } from '../domain/app/expenses/expense.model';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { Sales } from '../domain/app/sales/sale.model';
import { IUIWidget } from '../domain/app/widgets/ui-widget-base';
import { IWidget, IWidgetDocument } from '../domain/app/widgets/widget';
import { WidgetFactory } from '../domain/app/widgets/widget-factory';
import { Widgets } from '../domain/app/widgets/widget.model';
import { INameType } from './../domain/common/name-type';

@injectable()
export class WidgetsService {

    constructor(
        @inject(Dashboards.name) private _dashboards: Dashboards,
        @inject(Widgets.name) private _widgets: Widgets,
        @inject(Charts.name) private _charts: Charts,
        @inject(Sales.name) private _sales: Sales,
        @inject(Expenses.name) private _expenses: Expenses,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(WidgetFactory.name) private _widgetFactory: WidgetFactory
    ) { }

    async listWidgets(): Promise<IUIWidget[]> {
        try {
            const widgets = await this._widgets.model
                .find()
                .sort({ size: 1, order: 1, name: 1 });
            const materializedWidgets = await this.materializeWidgetDocuments(widgets);

            return materializedWidgets;
        } catch (e) {
            console.error('There was an error getting the list of widgets', e);
            return [];
        }
    }

    async previewWidget(data: IWidget): Promise<IUIWidget> {
        try {
            const uiWidget = await this._widgetFactory.getInstance(data);
            return uiWidget.materialize();
        } catch (e) {
            console.log('error when previewing the widget: ' + e);
            return e;
        }
    }

    async getWidgetById(id: string): Promise<IUIWidget> {
        try {
            const widgetDocument = await this._widgets.model.findOne({ _id: id });
            const widgetAsObject = <IWidget>widgetDocument.toObject();
            const uiWidget = await this._widgetFactory.getInstance(widgetAsObject);

            return uiWidget.materialize();
        } catch (e) {
            console.error(`error when getting the widget(${id}):  ${e}`);
        }
    }

    async getWidgetByName(name: string): Promise<IUIWidget> {
        try {
            const widgetDocument = await this._widgets.model.findOne({ name: name });
            const widgetAsObject = <IWidget>widgetDocument.toObject();
            const uiWidget = await this._widgetFactory.getInstance(widgetAsObject);

            return uiWidget.materialize();
        } catch (e) {
            console.log(`error when getting the widget(${name}):  ${e}`);
        }
    }

    materializeWidgetDocuments(docs: IWidgetDocument[]): Promise<IUIWidget[]> {
        if (!docs || !docs.length) return Promise.resolve([]);

        const that = this;

        return new Promise<IUIWidget[]>((resolve, reject) => {
            const uiWidgetsPromises = [];

            docs.forEach(d => {
                const widgetAsObject = <IWidget>d.toObject();
                uiWidgetsPromises.push(
                    that._widgetFactory.getInstance(widgetAsObject).then(uiWidget => {
                        return uiWidget.materialize();
                    })
                );
            });

            Promise.all(uiWidgetsPromises).then(materializedWidgets => {
                resolve(materializedWidgets);
                return;
            })
            .catch(err => {
                reject(err);
            });
        });
    }

    // widget is a dependency of dashboards
    // In order to remove a widget It cannot be in use
    removeWidgetById(id: string): Promise<IWidgetDocument> {
        const that = this;

        if (!id) {
            Promise.reject(
                { field: 'id', errors: ['widget not found'] }
            );
            return;
        }

        return new Promise<IWidgetDocument>((resolve, reject) => {
            that._findWidgetDependantsById(id)
                .then((dependants: INameType[]) => {
                    if (dependants && dependants.length) {
                        reject(
                            {
                                field: '__isDependencyOf',
                                errors: dependants.map(d => `${d.type} ${d.name}`)
                            }
                        );
                        return;
                    }
                    that._widgets.model.removeWidget(id).then(widget => {
                        resolve(widget);
                        return;
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    // returns an array of Objects ex:( [{ name: 'Financial', type: 'Dashboard' }])
    private _findWidgetDependantsById(id: string): Promise<INameType[]> {
        const that = this;
        return new Promise<INameType[]>((resolve, reject) => {
            that._dashboards
                .model
                .find({ widgets: { $in: [id]}})
                .then(dashboards => {
                    const result = dashboards.map(d => { return { name: d.name, type: 'Dashboard '}; });
                    return resolve(result);
                })
                .catch(err => reject(err));
        });
    }
}