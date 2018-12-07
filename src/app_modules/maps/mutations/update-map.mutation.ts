import { name } from 'aws-sdk/clients/importexport';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateMapActivity } from '../activities/update-map.activity';
import { MapAttributesInput, MapMutationResponse } from '../map.types';
import { Logger } from './../../../domain/app/logger';
import { IMapInput } from '../../../domain/app/maps/maps';
import { MapsService } from '../../../services/maps.service';

@injectable()
@mutation({
    name: 'updateMap',
    activity: UpdateMapActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: MapAttributesInput, required: true },
    ],
    output: { type: MapMutationResponse }
})
export class UpdateMapMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(MapsService.name) private _mapsService: MapsService) {
        super();
    }

    run(data: { id: string, input: MapAttributesInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._mapsService
                .updateMap(data.id, data.input)
                .then((map) => {
                    resolve({ entity: map, success: true });
                    return;
                })
                .catch(err => {
                    that._logger.error(err);
                    resolve({ success: false, errors: [ { field: 'map', errors: [err] } ]});
                    return;
                });
        });
    }
}
