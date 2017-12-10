import * as mongoose from 'mongoose';

import { IAccountModel } from './accounts';
import { IConnectorModel } from './connectors';
import { ICountryModel, IStateModel } from './countries';
import { IIndustryModel } from './industries';
import { IZipToMapModel } from './zip-to-map/IZipToMap';

export interface IMasterModels {
    Connection: mongoose.Connection;
    Connector: IConnectorModel;
    Account: IAccountModel;
    Industry: IIndustryModel;
    Country: ICountryModel;
    State: IStateModel;
    ZipToMap: IZipToMapModel;
}
