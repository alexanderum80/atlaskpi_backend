import { ConnectorsService } from '../../../services/connectors/connectors.service';
import { IIdentity } from '../../../models/app/identity';
import * as Promise from 'bluebird';
import { IConnectorModel } from '../../..';
import { IMutation } from '../..';
import { IMutationResponse } from '../../../models/common';

export class RemoveConnectorMutation implements IMutation<IMutationResponse> {
    constructor(public identity: IIdentity, private _ConnectorModel: IConnectorModel) {}

    run(data: { id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            const connectorsService = new ConnectorsService(that._ConnectorModel);
            connectorsService.removeConnector(data.id)
                .then((deletedConnector) => {
                    resolve({ success: true, entity: deletedConnector });
                    return;
                }).catch((err) => resolve({ success: false, errors: [ {field: 'connector', errors: [err]} ] }) );
        });
    }
}
