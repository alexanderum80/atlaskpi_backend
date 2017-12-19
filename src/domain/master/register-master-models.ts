import { IBridgeContainer } from '../../framework/di/bridge-container';
import { Accounts } from './accounts/account.model';
import { Countries } from './countries/country.model';
import { Industries } from './industries/industry.model';
import { Connectors } from './connectors/connector.model';
import { MasterConnection } from './master.connection';


export function registerMasterModels(container: IBridgeContainer) {
    container.registerPerWebRequest(Accounts);
    container.registerPerWebRequest(Industries);
    container.registerPerWebRequest(Countries);
    container.registerPerWebRequest(Connectors);

    container.registerPerWebRequest(MasterConnection);
}