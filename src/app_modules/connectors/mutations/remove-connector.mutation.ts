import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Logger } from '../../../domain/app/logger';
import { Connectors } from '../../../domain/master/connectors/connector.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { RemoveConnectorActivity } from './../activities/remove-connector.activity';
import { ConnectorResult } from './../connectors.types';
import { ConnectorsService } from '../../../services/connectors.service';

@injectable()
@mutation({
    name: 'removeConnector',
    activity: RemoveConnectorActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: ConnectorResult }
})
export class RemoveConnectorMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ConnectorsService.name) private _connectorsService: ConnectorsService,
        @inject(Logger.name) private _logger: Logger,
    ) {
        super();
    }

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            if (!data.id) {
                return reject({ success: false,
                                errors: [ { field: 'id', errors: ['Chart not found']} ] });
            }

            that._connectorsService.removeConnector(data.id)
            .then((deletedConnector) => {
                resolve({ success: true, entity: JSON.stringify(deletedConnector) });
                return;
            }).catch((err) =>  {
                that._logger.error(err);
                resolve({ success: false, entity: JSON.stringify(err.entity) });
            });
        });
    }
}
