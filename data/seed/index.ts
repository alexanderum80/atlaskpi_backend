import { IAccountModel, IIndustryModel} from '../models/master';
import seedAccounts from './accounts';
import seedCustomer2 from './customer1';
import seedRoles from './roles';
// import seedBusinessUnit from './business-units';
import seedIndustries from './industries';

import { getMasterContext, getContext } from '../models';

import { seedApp } from './app/seed-app';

// const connectionString = 'mongodb://customer2:p]9E8YeJJDL+@cluster0-shard-00-00-unrxu.mongodb.net:27017,cluster0-shard-00-01-unrxu.mongodb.net:27017,cluster0-shard-00-02-unrxu.mongodb.net:27017/customer2?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
const connectionString = 'mongodb://localhost/company-test-3002';

export default function seed() {
    seedRoles(connectionString);
    // seedAccounts(connectionString);
    seedIndustries(connectionString);
    seedCustomer2(connectionString);
    seedApp(connectionString);
    // seedBusinessUnit(connectionString);
}