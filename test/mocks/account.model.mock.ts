import { IAccountModel } from '../../src/domain/master/accounts/Account';
import * as sinon from 'sinon';

export function getAccountModelMock(): IAccountModel {
    return <any> {
        createNewAccount: sinon.stub(),
        findAccountByHostname: sinon.stub()
    };
}