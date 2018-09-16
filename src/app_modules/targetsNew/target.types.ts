import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { input } from '../../framework/decorators/input.decorator';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { MilestoneInput } from '../milestones/milestone.types';


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
    id: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    deliveryMethod: string[];
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

    @field({ type: GraphQLTypesMap.String })
    kpi: { type: string, required: true };

    @field({ type: ReportOptionsNew })
    reportOptions: ReportOptionsNew;

    @field({ type: GraphQLTypesMap.String })
    compareTo: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String })
    recurrent: { type: boolean, required: true };

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
    owner: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String })
    active: { type: boolean };

    @field({ type: GraphQLTypesMap.String })
    selected: { type: boolean };

    @field({ type: GraphQLTypesMap.Float })
    target: number;

    @field({ type: GraphQLTypesMap.String })
    period: { type: string, required: true };

}


@input()
export class deliveryMethodNewInput {
    @field({ type: GraphQLTypesMap.String })
    email: boolean;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    push: boolean[];
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
    milestones: NotificationConfigNewInput;


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

@type()
export class TargetResponse  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    datepicker: string;

    @field({ type: GraphQLTypesMap.String })
    vary: string;

    @field({ type: GraphQLTypesMap.Float })
    amount: number;

    @field({ type: GraphQLTypesMap.String })
    amountBy: string;

    @field({ type: GraphQLTypesMap.Boolean })
    active: boolean;

    @field({ type: GraphQLTypesMap.Float })
    target: number;

    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String })
    period: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    visible: string[];

    @field({ type: GraphQLTypesMap.String })
    owner: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    chart: string[];

    @field({ type: GraphQLTypesMap.String })
    stackName: string;

    @field({ type: GraphQLTypesMap.String })
    nonStackName: string;

}

