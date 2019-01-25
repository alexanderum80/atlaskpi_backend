
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

const sampleFunnel: any = {
    _id: '1',
    name: 'Inquires to Surgery Pipeline',
    stages: [
      {
        _id: '1',
        order: 1,
        name: 'Inquires',
        count: 100,
        amount: 1000000,
        foreground: '#fff',
        background: '#FF3D00',
      },
      {
        _id: '2',
        order: 2,
        name: 'Scheduled Consults',
        count: 60,
        amount: 350000,
        foreground: '#fff',
        background: '#FF6F00',
      },
      {
        _id: '3',
        order: 3,
        name: 'Completed Consults',
        count: 50,
        amount: 320000,
        foreground: '#fff',
        background: '#FFC107',
      },
      {
        _id: '4',
        order: 4,
        name: 'Scheduled Surgeries',
        count: 33,
        amount: 320000,
        foreground: '#fff',
        background: '#4CAF50',
        compareToStageName: 'Completed Consults',
        compareToStageValue: 65
      },
      {
        _id: '5',
        order: 5,
        name: 'Completed Surgeries',
        count: 30,
        amount: 192000,
        foreground: '#fff',
        background: '#304FFE',
        compareToStageName: 'Completed Consults',
        compareToStageValue: 60
      },
    ]
  };

interface IStageData {
  _id: string;
  count: number;
  amount: number;
}

@injectable()
export class FunnelsService {
    private _timezone: string;

    constructor(
        @inject(CurrentUser.name) private _currentUser: CurrentUser,
        @inject(Logger.name) private _logger: Logger,
        @inject(KpiFactory.name) private _kpiFactory: KpiFactory,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources,
        @inject(KPIs.name) private _kpis: KPIs,
    ) {
      this._timezone = this._currentUser.get().profile.timezone;
    }

    public async renderByDefinition(input: FunnelInput): Promise<RenderedFunnelType> {
      const { name, stages } = input;

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
              const percent =
                Math.floor(
                    ((thisRenderedStage.amount * 100) / foundTotalStage.amount)
                    * 100
                ) / 100;

              thisRenderedStage.compareToStageValue = percent;
          });

        } catch (err) {
            this._logger.error(err);
            throw err;
            return null;
        }

        const rendered: RenderedFunnelType = {
            name,
            stages: renderedStages
        };

      return rendered;
    }

    public async renderByDefinitionMock(input: FunnelInput): Promise<RenderedFunnelType> {
        // return sampleFunnel;

        const { name, stages } = input;

        const mockStages: RenderedFunnelStageType[]  = [];

        if (!input.stages || !input.stages.length) { return { name, stages: []} as RenderedFunnelType; }

        // this method should go to the server
        // mockig the data for now

        input.stages.forEach((stage, index) => {
            const { compareToStage, foreground, background } = stage;
            const stageName = stage.name;

            const newStage: RenderedFunnelStageType = {
                foreground,
                background,
                name: stageName,
                compareToStageName: compareToStage,
                amount: sampleFunnel.stages[index].amount,
                count: sampleFunnel.stages[index].count,
                order: index
            };

            mockStages.push(newStage);
        });

        const rendered: RenderedFunnelType = {
            name,
            stages: mockStages
        };

        return rendered;
    }

    private async _calcStageData(stage: FunnelStageInput): Promise<IStageData> {
        const kpiDocument = await this._kpis.model.findOne({ _id: stage.kpi });

        if (!kpiDocument) throw new Error('kpi not found');

        const [count, amount] = await Bluebird.all(
          [
            this._calculateStageCount(kpiDocument, stage.dateRange),
            this._calculateStageAmount(kpiDocument, stage.dateRange)
          ]
        );

        return {
          count,
          amount,
          _id: stage._id,
        };
    }

    private async _calculateStageCount(kpiDocument: IKPIDocument, dateRange: ChartDateRangeInput): Promise<number> {
        // in this method we modify the expression to get the count of customers
        const kpiObject = kpiDocument.toObject();

        kpiObject.expression = 'count(appointments.customer.externalId)';

        const kpi = await this._kpiFactory.getInstance(kpiObject);
        const dr = processDateRangeWithTimezone(dateRange, this._timezone);

        const res = await kpi.getData([dr], { filter: null });
        return (res[0] || {}).value || 0;
    }

    private async _calculateStageAmount(kpiDocument: IKPIDocument, dateRange: ChartDateRangeInput): Promise<number> {
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