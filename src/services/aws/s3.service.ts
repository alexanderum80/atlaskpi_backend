import { inject, injectable } from 'inversify';
import { IAppConfig } from '../../configuration/config-models';
import { S3 } from 'aws-sdk';

export interface IS3ObjectLocation {
    bucket: string;
    key: string;
}

@injectable()
export class S3Service {
    private _s3: S3;
    private _bucket = 'content.atlaskpi.com';
    

    constructor(@inject('Config') private _config: IAppConfig) {
        this._s3 = new S3({
            accessKeyId: _config.aws.accessKeyId,
            secretAccessKey: _config.aws.secretAccessKey
         });
    }

    uploadProfilePicture(tenant: string, name: string, md5: string, data: Buffer): Promise<IS3ObjectLocation> {
        const that = this;
        const key = `${tenant}/${md5}_${name}`;
        
        return new Promise<IS3ObjectLocation>((resolve, reject) => {
            that._s3.putObject({
                Bucket: that._bucket,
                Key: key,
                Body: data
            }, (err, data) => {
                if (err) {
                    return reject(err);
                }

                resolve({
                    bucket: that._bucket,
                    key: key
                });
            })
        });
    }

    getProfilePicture(tenant: string, name: string, md5: string): Promise<Buffer> {
        const that = this;
        
        return new Promise<boolean>((resolve, reject) => {
            that._s3.getObject({
                Bucket: that._bucket,
                Key: `${tenant}/${md5}_${name}`
            }, (err, data) => {

            });
        });
    }

}