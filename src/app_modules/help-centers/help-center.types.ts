import { IHelpCenter } from '../../domain/app/help-center/help-center';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import * as moment from 'moment';

@type()
export class HelpCenterResponse {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    duration: string;

    @field({ type: GraphQLTypesMap.String })
    url: string;

    @resolver({ forField: 'duration' })
    static resolveDuration = (entity: IHelpCenter) => moment(entity.duration).format('HH:mm:ss')
}
