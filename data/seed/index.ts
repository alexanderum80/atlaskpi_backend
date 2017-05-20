import { IAccountModel, IIndustryModel} from '../models/master';
import seedAccounts from './accounts';
import seedCustomer2 from './customer1';
import seedRoles from './roles';
import seedBusinessUnit from './business-units';
import seedCharts from './charts';
import seedIndustries from './industries';

import { getMasterContext, getContext } from '../models';

import { seedApp } from './app/seed-app';

export default function seed() {

    getMasterContext().then((masterContext) => {

        let Account = masterContext.Account;
        let Industry = masterContext.Industry;

        getContext('mongodb://localhost/customer2').then((accountCtx) => {

            seedRoles(accountCtx);
            seedAccounts(Account);
            seedIndustries(Industry);
            seedCustomer2(accountCtx);
            seedApp(accountCtx);
            seedBusinessUnit(accountCtx);
            seedCharts(accountCtx);
        });
    });
}