import { IBridgeContainer } from '../../framework/di/bridge-container';
import { Accounts } from './accounts/account.model';
import { Connectors } from './connectors/connector.model';
import { Countries } from './countries/country.model';
import { Industries } from './industries/industry.model';
import { MasterConnection } from './master.connection';
import { ZipsToMap } from './zip-to-map/zip-to-map.model';


export function registerMasterModels(container: IBridgeContainer) {
    container.registerPerWebRequest(Accounts);
    container.registerPerWebRequest(Industries);
    container.registerPerWebRequest(Countries);
    container.registerPerWebRequest(Connectors);
    container.registerPerWebRequest(ZipsToMap);

    container.registerPerWebRequest(MasterConnection);
}