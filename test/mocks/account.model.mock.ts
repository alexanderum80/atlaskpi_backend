import { IAccountModel, IAccountDocument } from '../../data/models';
import * as sinon from 'sinon';

export function getAccountModelMock(): IAccountModel {
    return <any> {
        createNewAccount: sinon.stub(),
        findAccountByHostname: sinon.stub()
    };
}