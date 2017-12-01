import { ICountryModel, IStateModel } from './countries';
import { IIndustryModel } from './industries';
import { IAccountModel } from './accounts';
import * as mongoose from 'mongoose';

export interface IMasterModels {
    Connection: mongoose.Connection;
    Account: IAccountModel;
    Industry: IIndustryModel;
    Country: ICountryModel;
    State: IStateModel;
}
