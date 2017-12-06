import { Countries } from './countries/country.model';
import { Industries } from './industries/industry.model';
import { MasterConnection } from './';
import { Accounts } from './accounts/account.model';
import { Container } from 'inversify';

export function registerMasterModels(container: Container) {
    container.bind<Accounts>('Accounts').to(Accounts).inRequestScope();
    container.bind<Industries>('Industries').to(Industries).inRequestScope();
    container.bind<Countries>('Countries').to(Countries).inRequestScope();

    container.bind<MasterConnection>('MasterConnection').to(MasterConnection).inRequestScope();
}