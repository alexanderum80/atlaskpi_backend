import { IConnectorModel } from './connectors/IConnector';
import { IIndustryModel } from './industries';
import { IAccountModel } from './accounts';
import * as mongoose from 'mongoose';

export interface IMasterModels {
    Connection: mongoose.Connection;
    Connector: IConnectorModel;
    Account: IAccountModel;
    Industry: IIndustryModel;
}
