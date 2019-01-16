import { convertStringDateRangeToDateDateRange } from '../domain/common/date-range';
import { CurrentUser } from '../domain/app/current-user';
import { difference } from 'lodash';
import { IDashboardDocument } from './../domain/app/dashboards/dashboard';
import { IWidgetInput } from './../domain/app/widgets/widget';
import { inject, injectable } from 'inversify';
import * as BlueBird from 'bluebird';
import { Charts } from '../domain/app/charts/chart.model';
import { Dashboards } from '../domain/app/dashboards/dashboard.model';
import { IUIWidget } from '../domain/app/widgets/ui-widget-base';
import { IWidget, IWidgetDocument } from '../domain/app/widgets/widget';
import { WidgetFactory } from '../domain/app/widgets/widget-factory';
import { Widgets } from '../domain/app/widgets/widget.model';
import { INameType } from './../domain/common/name-type';
import { attachToDashboards } from '../app_modules/widgets/mutations/common';
import { Logger } from '../domain/app/logger';
import { detachFromDashboards } from '../app_modules/widgets/mutations/common';
import { ScheduleJobs } from '../domain/app/schedule-job/schedule-job.model';

@injectable()
export class WidgetsService {

    private _timezone;

    constructor(
        @inject(Dashboards.name) private _dashboards: Dashboards,
        @inject(Widgets.name) private _widgets: Widgets,
        @inject(WidgetFactory.name) private _widgetFactory: WidgetFactory,
        @inject(ScheduleJobs.name) private _scheduleJobs: ScheduleJobs,
        @inject(Logger.name) private _logger: Logger,
        @inject(CurrentUser.name) private _user: CurrentUser
    ) {
        this._timezone = _user.get().profile.timezone;
    }

    public async createWidget(input: IWidgetInput): Promise<IWidget> {
        try {
            const inputDashboards = <any>input.dashboards || [];


            // IMPORTANT!!!: transform date from string to date based on user timezone.
            const tz = this._user.get().profile.timezone;
            input.numericWidgetAttributes.dateRange
                = convertStringDateRangeToDateDateRange(input.numericWidgetAttributes.dateRange as any, tz) as any;


            // create the widget
            const widget = await this._widgets.model.createWidget(input);

            // attach widget to dashboard
            await attachToDashboards(this._dashboards.model, inputDashboards, widget._id);

            return widget;
        } catch (e) {
            this._logger.error('There was an error creating a widget', e);
            return null;
        }
    }

    public async updateWidget(id: string, input: IWidgetInput): Promise<IWidget> {
        try {
            const inputDashboards = <any>input.dashboards || [];
            // resolve dashboards to include the widget
            const widgetsDashboards = await this._dashboards.model.find( {widgets: { $in: [id] }});

            const currentDashboardIds = widgetsDashboards.map(d => String(d._id));
            const toRemoveDashboardIds = difference(currentDashboardIds, inputDashboards);
            const toAddDashboardIds = difference(inputDashboards, currentDashboardIds);

            // IMPORTANT!!!: transform date from string to date based on user timezone.
            const tz = this._user.get().profile.timezone;
            input.numericWidgetAttributes.dateRange
                = convertStringDateRangeToDateDateRange(input.numericWidgetAttributes.dateRange as any, tz) as any;

            // update the widget
            const widget = await this._widgets.model.updateWidget(id, input);

            // detach widget to dashboard
            await detachFromDashboards(this._dashboards.model, toRemoveDashboardIds, widget._id);

            // attach widget to dashboard
            await attachToDashboards(this._dashboards.model, toAddDashboardIds, widget._id);

            return widget;
        } catch (e) {
            this._logger.error('There was an error updating the widget', e);
            return null;
        }
    }

    async listWidgets(options = { materialize: true }): Promise<IUIWidget[]> {
        options = options || { materialize: true };

        if (options.materialize === undefined) {
            options.materialize = true;
        }

        const { materialize } = options;
        try {
            const widgetDocuments = await this._widgets.model
                .find()
                .sort({ size: 1, order: 1, name: 1 });

            let widgets = [];
            if (materialize) {
                widgets = await this.materializeWidgetDocuments(widgetDocuments);
            } else {
                widgets = widgetDocuments.map(d => d.toObject());
            }

            return widgets;
        } catch (e) {
            console.error('There was an error getting the list of widgets', e);
            return [];
        }
    }

    async previewWidget(data: any): Promise<IUIWidget> {
        try {
            // IMPORTANT!!!: transform date from string to date based on user timezone.
            const tz = this._user.get().profile.timezone;

            // it could be a chart widget
            if(data.numericWidgetAttributes){
            data.numericWidgetAttributes.dateRange
                = convertStringDateRangeToDateDateRange(data.numericWidgetAttributes.dateRange as any, tz) as any;
            }

            const uiWidget = await this._widgetFactory.getInstance(data);
            return uiWidget.materialize({ timezone: this._timezone });
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
            const materializedWidget = await uiWidget.materialize({ timezone: this._timezone });

            const dashboards = await this._resolveDashboards(uiWidget);
            if (dashboards.length > 0) {
                materializedWidget['dashboards'] = dashboards.map((d) => d._id);
            }
            return materializedWidget;

        } catch (e) {
            console.error(`error when getting the widget(${id}):  ${e}`);
        }
    }

    async getWidgetByName(name: string): Promise<IUIWidget> {
        try {
            const widgetDocument = await this._widgets.model.findOne({ name: name });
            const widgetAsObject = <IWidget>widgetDocument.toObject();
            const uiWidget = await this._widgetFactory.getInstance(widgetAsObject);

            return uiWidget.materialize({ timezone: this._timezone });
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
                widgetAsObject['position'] = d.position;
                uiWidgetsPromises.push(
                    that._widgetFactory.getInstance(widgetAsObject).then(uiWidget => {
                        return uiWidget.materialize({ timezone: this._timezone });
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

                    // remove alert from widget
                    const deleteModel = {
                        widget: that._widgets.model.removeWidget(id),
                        alert: that._scheduleJobs.model.removeScheduleJobByModelId(id)
                    };
                    BlueBird.props(deleteModel).then(documents => {
                        resolve(documents.widget);
                        return;
                    })
                    .catch(err => {
                        reject(err);
                        return;
                    });
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

    async _resolveDashboards(widget): Promise<IDashboardDocument[]> {
        const that = this;
        return await new Promise<IDashboardDocument[]>((resolve, reject) => {
            that._dashboards.model.find( { widgets: { $in: [widget._id] }}).exec()
                .then((dashboards) => resolve(dashboards))
                .catch(err => reject(err));
        });
    }
}