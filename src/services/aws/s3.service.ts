import { inject, injectable } from 'inversify';
import { IAppConfig } from '../../configuration/config-models';

@injectable()
export class S3Service {

    constructor(@inject('Config') private _config: IAppConfig) { }

    uploadProfilePicture() {

    }

    getProfilePicture() {

    }

}