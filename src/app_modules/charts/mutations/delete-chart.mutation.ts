import { Slideshows } from '../../../domain/app/slideshow/slideshow.model';
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
import { concat } from 'lodash';

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
        @inject(Widgets.name) private _widgetModel: Widgets,
        @inject(Slideshows.name) private _slideShowModel: Slideshows) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {

            const findWidget = that._widgetModel.model.find({
                'type': 'chart',
                'chartWidgetAttributes.chart': data.id
            });

            const findSlideShow = that._slideShowModel.model.find({
                charts: {
                    $in: [data.id]
                }
            });

            const models = {
                widget: findWidget,
                slideshow: findSlideShow
            };

            Promise.props(models).then(documents => {
                const hasWidget = documents.widget && documents.widget.length;
                const hasSlideShow = documents.slideshow && documents.slideshow.length;

                if (hasWidget || hasSlideShow) {
                    let widgetArray = [];
                    let slideShowArray = [];

                    widgetArray = hasWidget ? documents.widget.map(document => `Widget ${document.name}`) : widgetArray;
                    slideShowArray = hasSlideShow ? documents.slideshow.map(document => `SlideShow ${document.name}`) : [];

                    const combineModelErrors = concat(widgetArray, slideShowArray);
                    resolve({
                        success: false,
                        errors: [
                            {
                                field: '__isDependencyOf',
                                errors: combineModelErrors
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
