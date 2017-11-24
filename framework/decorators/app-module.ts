import { updateMetadata } from './helpers';
import { IQuery } from '../queries/query';
import { IMutation } from '../mutations/mutation';
import { MetadataFieldsMap } from './metadata-fields.map';

export interface IModuleOptions {
    imports?: IModuleOptions[];
    queries?: Array<new () => IQuery<any>>;
    mutations?: Array<new () => IMutation<any>>;
}

export function Module(options: IModuleOptions) {
    return function (target) {
        updateMetadata(target, null, MetadataFieldsMap.Definition, options);
    };
}
