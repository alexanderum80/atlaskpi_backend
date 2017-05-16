import seedAccounts from './accounts';
import seedCustomer2 from './customer1';
import seedRoles from './roles';
import seedBusinessUnit from './business-units';
import seedCharts from './charts';

import { seedApp } from './app/seed-app';

export default function seed() {
    seedRoles();
    seedAccounts();
    seedCustomer2();
    seedApp();
    seedBusinessUnit();
    seedCharts();
}