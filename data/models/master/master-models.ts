import { ICountryModel, IStateModel } from './countries';
import { IIndustryModel } from './industries';
import { IAccountModel } from './accounts';
import { IConnectorModel } from './connectors';
import * as mongoose from 'mongoose';

export interface IMasterModels {
    Connection: mongoose.Connection;
    Connector: IConnectorModel;
    Account: IAccountModel;
    Industry: IIndustryModel;
    Country: ICountryModel;
    State: IStateModel;
}
