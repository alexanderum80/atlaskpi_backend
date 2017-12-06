
import { input, type, field, GraphQLTypesMap, ErrorDetails } from '../../framework';


@type()
export class Department  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    manager: string;

}


@type()
export class UpdateDepartmentResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Department })
    entity: Department;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class CreateDepartmentResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Department })
    entity: Department;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class DeleteDepartmentResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Department })
    entity: Department;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

