import { name } from 'aws-sdk/clients/importexport';
import { inject, injectable } from 'inversify';
import { Logger } from '../../../domain/app/logger';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateMapActivity } from '../activities/create-map.activity';
import { MapAttributesInput, MapMutationResponse } from '../map.types';
import { MapMarkerService } from '../../../services/map-marker.service';
import { IMapDocument } from '../../../domain/app/maps/maps';
import { Dashboards } from '../../../domain/app/dashboards/dashboard.model';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { Maps } from '../../../domain/app/maps/maps.model';
import { attachMapToDashboards } from './common';

@injectable()
@mutation({
    name: 'createMap',
    activity: CreateMapActivity,
    parameters: [
        { name: 'input', type: MapAttributesInput },
    ],
    output: { type: MapMutationResponse }
})
export class CreateMapMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject('Logger') private _logger: Logger,
        @inject(Dashboards.name) private _dashboards: Dashboards,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Maps.name) private _maps: Maps,
    ) {
        super();
    }

    async run(data: { input: MapAttributesInput }): Promise<IMutationResponse> {
        try {
            const map = await this.createMap(data.input);
            return { success: true, entity: map};
        } catch (e) {
            this._logger.error(e);
            return { success: false, errors: [ e ] };
        }
    }
    private async createMap(input: MapAttributesInput): Promise<IMapDocument> {
        try {
            const kpis = await this._kpis.model.find({ _id: { $in: input.kpi }});
            if (!kpis) {
                this._logger.error('one or more kpi not found');
                throw new Error('one or more kpis not found');
            }
            // resolve dashboards to include the map
            const dashboards = await this._dashboards.model.find( {_id: { $in: input.dashboards }});
            const inputDashboards = input.dashboards || [];
            if (!dashboards || dashboards.length !== inputDashboards.length) {
                this._logger.error('one or more dashboard not found');
                throw new Error('one or more dashboards not found');
            }
            // create the map
            const map = await this._maps.model.createMap(input);
            await attachMapToDashboards(this._dashboards.model, this._maps.model , input.dashboards, map);
            return map;
        } catch (e) {
            this._logger.error('There was an error creating a map', e);
            return null;
        }
    }
}

