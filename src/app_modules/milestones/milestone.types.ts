import { ErrorDetails } from '../../framework/graphql/common.types';
import { Employee } from '../employees/employees.types';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { field } from '../../framework/decorators/field.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';

@input()
export class MilestoneInput {
    @field({ type: GraphQLTypesMap.String, required: true})
    target: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    task: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    dueDate: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    status: string;

    @field({ type: GraphQLTypesMap.String, isArray: true, required: true})
    responsible: string[];
}

@input()
export class MilestoneNotificationInput {
    @field({ type: GraphQLTypesMap.String, required: true })
    email: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    task: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    dueDate: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    fullName: string;
}

@type()
export class Milestone {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    target: string;

    @field({ type: GraphQLTypesMap.String })
    task: string;

    @field({ type: GraphQLTypesMap.String })
    dueDate: string;

    @field({ type: GraphQLTypesMap.String })
    status: string;

    @field({ type: Employee, isArray: true })
    responsible: Employee[];
}

@type()
export class MilestoneResponse {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Milestone })
    entity: Milestone;

    @field({type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}
