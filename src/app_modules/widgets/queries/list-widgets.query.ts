import { Logger } from './../../../domain/app/logger';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IUIWidget } from '../../../domain/app/widgets/ui-widget-base';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { WidgetsService } from '../../../services/widgets.service';
import { ListWidgetsActivity } from '../activities/list-widgets.activity';
import { Widget } from '../widgets.types';

@injectable()
@query({
    name: 'listWidgets',
    activity: ListWidgetsActivity,
    output: { type: Widget, isArray: true }
})
export class ListWidgetsQuery implements IQuery<IUIWidget[]> {
    constructor(
        @inject(WidgetsService.name) private _widgetsService: WidgetsService,
        @inject(Logger.name) private _logger: Logger
    ) { }

    run(data: { id: string }): Promise<IUIWidget[]> {
        const that = this;
        return new Promise<IUIWidget[]>((resolve, reject) => {
            that._widgetsService
                .listWidgets()
                .then(widgets => { return resolve(widgets); })
                .catch(err => {
                    that._logger.error(err);
                    resolve([]);
                });
        });
    }
}
