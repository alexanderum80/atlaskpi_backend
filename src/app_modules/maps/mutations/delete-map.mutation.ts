import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteMapActivity } from '../activities/delete-map.activity';
import { MapMutationResponse } from '../map.types';
import { Logger } from './../../../domain/app/logger';
import { MapsService } from '../../../services/maps.service';

@injectable()
@mutation({
    name: 'deleteMap',
    activity: DeleteMapActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: MapMutationResponse }
})
export class DeleteMapMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(MapsService.name) private _mapsService: MapsService) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;
        return new Promise<IMutationResponse>((resolve, reject) => {
            that._mapsService.deleteMap(data.id)
                .then(map => {
                    resolve({ success: true, entity: map });
                    return;
                }).catch(err => {
                    that._logger.error(err);
                    resolve({ success: false, errors: [ { field: 'id', errors: [err]} ] });
                    return;
                });
        });
    }
}
