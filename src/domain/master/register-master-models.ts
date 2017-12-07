import { Countries } from './countries/country.model';
import { Industries } from './industries/industry.model';
import { MasterConnection } from './';
import { Accounts } from './accounts/account.model';
import { Container } from 'inversify';
import { BridgeContainer } from '../../framework/di/bridge-container';

export function registerMasterModels(container: BridgeContainer) {
    container.registerPerWebRequest(Accounts);
    container.registerPerWebRequest(Industries);
    container.registerPerWebRequest(Countries);

    container.registerPerWebRequest(MasterConnection);
}