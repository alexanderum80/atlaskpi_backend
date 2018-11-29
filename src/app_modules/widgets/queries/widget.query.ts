import { inject, injectable } from 'inversify';

import { IUIWidget } from '../../../domain/app/widgets/ui-widget-base';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetWidgetActivity } from '../activities/get-widget.activity';
import { Widget } from '../widgets.types';
import { WidgetsService } from './../../../services/widgets.service';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';

@injectable()
@query({
    name: 'widget',
    cache: { ttl: 1800 },
    activity: GetWidgetActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: Widget }
})
export class WidgetQuery implements IQuery<IUIWidget> {
    constructor(
        @inject(WidgetsService.name)
        private _widgetsService: WidgetsService,
        @inject(ScheduleJobService.name)
        private _scheduleJobService: ScheduleJobService
    ) { }

    async run(data: { id: string }): Promise<IUIWidget> {
        const widget = await this._widgetsService.getWidgetById(data.id);
        if (!widget) return;

        const alerts = await this._scheduleJobService.getJobsByIdentifier(data.id);

        (widget as any).hasAlerts = alerts.length > 0;

        return widget;
    }
}
