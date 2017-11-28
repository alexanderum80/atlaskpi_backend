import { IIdentity } from '../../../models/app/identity';
import * as Promise from 'bluebird';
import { IConnectorModel } from '../../..';
import { IMutation } from '../..';
import { IMutationResponse } from '../../../models/common';

export class RemoveConnectorMutation implements IMutation<IMutationResponse> {
    constructor(public identity: IIdentity, private _ConnectorModel: IConnectorModel) {}

    run(data: any): Promise<IMutationResponse> {
        const that = this;
        const getData = data.hasOwnProperty('data') ? data.data : data;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._ConnectorModel.removeConnector(getData)
                .then((deletedConnector) => {
                    resolve({ success: true, entity: deletedConnector });
                    return;
                }).catch((err) => resolve({ success: false, errors: [ {field: 'connector', errors: [err]} ] }) );
        });
    }
}
