import { CurrentUser } from '../domain/app/current-user';
import { Logger } from '../domain/app/logger';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { RenderedFunnelType, FunnelInput, RenderedFunnelStageType, FunnelStageInput } from '../app_modules/funnels/funnels.types';
import { injectable, inject } from 'inversify';
import { KpiFactory } from '../app_modules/kpis/queries/kpi.factory';
import { IChartDateRange, processDateRangeWithTimezone } from '../domain/common/date-range';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { IKPIDocument } from '../domain/app/kpis/kpi';
import { ChartDateRangeInput } from '../app_modules/shared/shared.types';
import * as Bluebird from 'bluebird';
import { Funnels } from '../domain/app/funnels/funnel.model';
import { ReportService } from './report.service';


interface IStageData {
  _id: string;
  count: number;
  amount: number;
}

export interface IFunnelStageField {
  name: string;
  path: string;
  type: string;
}

export interface IFunnelStageDetails {
  columns: IFunnelStageField[];
  rows: any[];
}

@injectable()
export class FunnelsService {
    private _timezone: string;

    constructor(
        @inject(CurrentUser.name) private _currentUser: CurrentUser,
        @inject(Logger.name) private _logger: Logger,
        @inject(KpiFactory.name) private _kpiFactory: KpiFactory,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Funnels.name) private _funnels: Funnels,
        @inject(ReportService.name) private _reportService: ReportService,
    ) {
      this._timezone = this._currentUser.get().profile.timezone;
    }

    public async renderByDefinition(input: FunnelInput): Promise<RenderedFunnelType> {
      const { _id, name, stages } = input;

      const renderedStages: RenderedFunnelStageType[]  = [];

      try {

          // lets run the stages calcs in parallel
          const stagesData = await Bluebird.map(stages, s => this._calcStageData(s));

          // Create a Stage with it's core values ( count and amount )
          for (const stage of stages) {
              const { compareToStage, foreground, background } = stage;

              const newStage: RenderedFunnelStageType = {
                _id: stage._id,
                foreground,
                background,
                name: stage.name,
                compareToStageName: this._getStageName(compareToStage, input.stages),
                count: stagesData.find(sd => sd._id === stage._id).count,
                amount: stagesData.find(sd => sd._id === stage._id).amount,
                order: stage.order
              };
              console.log(stage.name);

              renderedStages.push(newStage);
          }

          // Calculate percent
          stages.forEach(inputStage => {
              if (!inputStage.compareToStage) return;

              const foundTotalStage = renderedStages.find(s => s._id === inputStage.compareToStage);
              const thisRenderedStage = renderedStages.find(s => s._id === inputStage._id);
              let percent =
                Math.floor(
                    ((thisRenderedStage.amount * 100) / foundTotalStage.amount)
                    * 100
                ) / 100;

              // handle infinity values
              if (!Number.isFinite(percent)) percent = -1;

              thisRenderedStage.compareToStageValue = percent;
          });

        } catch (err) {
            this._logger.error(err);
            throw err;
            return null;
        }

        const rendered: RenderedFunnelType = {
            _id,
            name,
            stages: renderedStages
        };

      return rendered;
    }

    public async renderById(_id: string): Promise<RenderedFunnelType> {
      try {
        const document = await this._funnels.model.findOne({ _id});

        if (!document) throw new Error('funnel not found');

        return await this.renderByDefinition(document.toObject());
      } catch (err) {
        this._logger.error(err);
        throw err;
      }
    }

    private async _calcStageData(stage: FunnelStageInput): Promise<IStageData> {
        const kpiDocument = await this._kpis.model.findOne({ _id: stage.kpi });
        if (!kpiDocument) throw new Error('kpi not found');

        const [count, amount] = await Bluebird.all(
          [
            this._calcStageCount(kpiDocument, stage.dateRange),
            this._calcStageAmount(kpiDocument, stage.dateRange)
          ]
        );

        return {
          count,
          amount,
          _id: stage._id,
        };
    }

    private async _calcStageCount(kpiDocument: IKPIDocument, dateRange: ChartDateRangeInput): Promise<number> {
        // in this method we modify the expression to get the count of customers
        const kpiObject = kpiDocument.toObject();

        kpiObject.expression = kpiObject.expression.replace('sum(', 'count(');

        const kpi = await this._kpiFactory.getInstance(kpiObject);
        const dr = processDateRangeWithTimezone(dateRange, this._timezone);

        const res = await kpi.getData([dr], { filter: null });
        return (res[0] || {}).value || 0;
    }

    private async _calcStageAmount(kpiDocument: IKPIDocument, dateRange: ChartDateRangeInput): Promise<number> {
        const kpiObject = kpiDocument.toObject();

        const kpi = await this._kpiFactory.getInstance(kpiObject);
        const dr = processDateRangeWithTimezone(dateRange, this._timezone);

        const res = await kpi.getData([dr], { filter: null });
        return (res[0] || {}).value || 0;
    }

    private _getStageName(id: string, stages: FunnelStageInput[]): string {
        const found = stages.find(s => s._id === id);
        return found && found.name;
    }
}