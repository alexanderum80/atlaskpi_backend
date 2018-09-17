import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';


@type()
export class DateRangeNew {
    @field({ type: GraphQLTypesMap.String })
    from: { type: string };

    @field({ type: GraphQLTypesMap.String })
    to: { type: string };
}

@type()
export class TargetUsersNew {
    @field({ type: GraphQLTypesMap.String })
    identifier: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    deliveryMethods: string[];
}

@type()
export class NotificationConfigNew {
    // @field({ type: GraphQLTypesMap.String, isArray: true })
    // notifiOnPercente: [{ type: number, required: true }];

    @field({ type: TargetUsersNew, isArray: true })
    users: TargetUsersNew[];
}

@type()
export class ReportOptionsNew {
    @field({ type: GraphQLTypesMap.String })
    frequency:  { type: string };

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings:  [{ type: string }];

    @field({ type: GraphQLTypesMap.String })
    timezone: { type: string, required: true };

    @field({ type: DateRangeNew })
    dateRange: DateRangeNew;

    @field({ type: GraphQLTypesMap.String })
    filter: { type: string[] };
}

@type()
export class SourceNew {
    @field({ type: GraphQLTypesMap.String })
    type: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String })
    identifier: { type: string, required: true };
}

@type()
export class Milestone {
    @field({ type: GraphQLTypesMap.String })
    task: string;

    @field({ type: GraphQLTypesMap.String })
    dueDate: string;

    @field({ type: GraphQLTypesMap.String })
    status: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    responsible: [string];

}

@type()
export class TargetNew  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: { type: string, required: true };

    @field({ type: SourceNew })
    source: SourceNew;

    @field({ type: ReportOptionsNew })
    reportOptions: ReportOptionsNew;

    @field({ type: GraphQLTypesMap.String })
    compareTo: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String })
    type: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String })
    value: string;

    @field({ type: GraphQLTypesMap.String })
    appliesTo: string;

    @field({ type: GraphQLTypesMap.String })
    unit: { type: string, required: true };

    @field({ type: NotificationConfigNew })
    notificationConfig: NotificationConfigNew;

    @field({ type: GraphQLTypesMap.String })
    active: { type: boolean };

    @field({ type: Milestone, isArray: true })
    milestones: Milestone[];


}


@input()
export class UsersNewInput {
    @field({ type: GraphQLTypesMap.String })
    identifier: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    deliveryMethods: string[];
}


@input()
export class NotificationConfigNewInput {
    // @field({ type: GraphQLTypesMap.String, isArray: true })
    // notifiOnPercente: [{ type: number, required: true }];

    @field({ type: UsersNewInput, isArray: true })
    users: UsersNewInput[];
}

@input()
export class DateRangeNewInput {
    @field({ type: GraphQLTypesMap.String })
    from: string;

    @field({ type: GraphQLTypesMap.String })
    to: string;
}


@input()
export class ReportOptionsNewInput {
    @field({ type: GraphQLTypesMap.String })
    frequency:  { type: string };

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings:  string[];

    @field({ type: GraphQLTypesMap.String })
    timezone: string;

    @field({ type: DateRangeNewInput })
    dateRange: DateRangeNewInput;

    @field({ type: GraphQLTypesMap.String })
    filter: string[];
}


@input()
export class SourceNewInput {
    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String })
    identifier: string;
}

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
export class TargetNewInput  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: SourceNewInput })
    source: SourceNewInput;

    @field({ type: GraphQLTypesMap.String })
    compareTo: string;

    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String })
    unit: string;

    @field({ type: GraphQLTypesMap.Float })
    value: string;

    @field({ type: GraphQLTypesMap.String })
    appliesTo: string;

    @field({ type: GraphQLTypesMap.Boolean })
    active: boolean;

    @field({ type: NotificationConfigNewInput })
    notificationConfig: NotificationConfigNewInput;

    @field({ type: MilestoneInput, isArray: true })
    milestones: MilestoneInput[];


}


@type()
export class UpdateTargetNewResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: TargetNew })
    entity: TargetNew;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class CreateTargetNewResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: TargetNew })
    entity: TargetNew;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class DeleteTargetNewResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: TargetNew })
    entity: TargetNew;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}
