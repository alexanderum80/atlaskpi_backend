import { IAppModels, IUserModel } from '../../data/models';
import * as sinon from 'sinon';

export function getAppContextMock(): IAppModels {
    return <any> {
        User: <any> {
            findOne: sinon.stub(),
        }
    }
}