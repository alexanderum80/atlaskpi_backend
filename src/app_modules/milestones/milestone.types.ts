import { IMilestone } from '../../domain/app/milestones/milestone';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { field } from '../../framework/decorators/field.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import * as moment from 'moment';
import {User} from '../users/users.types';

@input()
export class MilestoneInput {

    @field({ type: GraphQLTypesMap.String, required: true })
    task: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    dueDate: string;

    @field({ type: GraphQLTypesMap.String })
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
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

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

    @field({ type: GraphQLTypesMap.String, isArray: true })
    responsible: [string];

    @resolver({ forField: 'dueDate'})
    static formatDueDate = (entity: IMilestone) => moment(entity.dueDate).format('MM/DD/YYYY')

   
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
