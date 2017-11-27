import { IIndustryModel } from './industries';
import { IAccountModel } from './accounts';
import { IConnectorModel } from './connectors';
import * as mongoose from 'mongoose';

export interface IMasterModels {
    Connection: mongoose.Connection;
    Account: IAccountModel;
    Industry: IIndustryModel;
    Connector: IConnectorModel;
}
