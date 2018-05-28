import { isArray } from 'lodash';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';


@input()
export class AccessLevelsInput {
    @field({ type: GraphQLTypesMap.String, required: true, isArray: true })
    users: string[];

    @field({ type: GraphQLTypesMap.String, required: true, isArray: true })
    accessTypes: string[];

}

@input()
export class DashboardInput  {
    @field({ type: GraphQLTypesMap.String, required: true })
    name: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    description: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    charts: string[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    widgets: string[];

    @field({ type: GraphQLTypesMap.String })
    owner: string;

    @field({ type: GraphQLTypesMap.String, isArray: true})
    users: string[];

    @field({ type: GraphQLTypesMap.Boolean })
    visible?: boolean;
}

@type()
export class Dashboard  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    description: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    charts: string[];

    @field({ type: GraphQLTypesMap.String, isArray: true })
    widgets: string[];

    @field({ type: GraphQLTypesMap.String })
    owner: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    users: string[];

    @field({ type: GraphQLTypesMap.Boolean })
    visible?: boolean;
}


@type()
export class DashboardResponse {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Dashboard })
    entity: Dashboard;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}

