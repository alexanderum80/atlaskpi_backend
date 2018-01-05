import { Widgets } from '../../../domain/app/widgets/widget.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ChartsService } from '../../../services/charts.service';
import { DeleteChartActivity } from '../activities/delete-chart.activity';
import { ChartMutationResponse } from '../charts.types';
import { Logger } from './../../../domain/app/logger';

@injectable()
@mutation({
    name: 'deleteChart',
    activity: DeleteChartActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: ChartMutationResponse }
})
export class DeleteChartMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ChartsService.name) private _chartsService: ChartsService,
        @inject(Logger.name) private _logger: Logger,
        @inject(Widgets.name) private _widgetModel: Widgets) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {

            const findWidget = that._widgetModel.model.find({
                'type': 'chart',
                'chartWidgetAttributes.chart': data.id
            });

            const models = {
                widget: findWidget
            };

            Promise.props(models).then(documents => {
                if (documents.widget && documents.widget.length) {
                    resolve({
                        success: false,
                        errors: [
                            {
                                field: '__isDependencyOf',
                                errors: documents.widget.map(document => `Widget: ${document.name}`)
                            }
                          ]
                        });
                    return;
                }

                that._chartsService.deleteChart(data.id).then(chart => {
                    resolve({ success: true, entity: chart });
                    return;
                }).catch(err => {
                    that._logger.error(err);
                    resolve({ success: false, errors: [ { field: 'id', errors: [err]} ] });
                    return;
                });
            });
        });
    }
}
