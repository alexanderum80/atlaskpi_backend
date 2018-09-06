import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { input } from '../../framework/decorators/input.decorator';


@type()
export class DateRangeNew {
    @field({ type: GraphQLTypesMap.String })
    from: { type: string };

    @field({ type: GraphQLTypesMap.String })
    to: { type: string };
}

@type()
export class UsersNew {
    @field({ type: GraphQLTypesMap.String })
    id: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String, isArray: true })
    deliveryMethod: [{ type: string, required: true }];
}

@type()
export class NotificationConfigNew {
    @field({ type: GraphQLTypesMap.String, isArray: true })
    notifiOnPercente: [{ type: number, required: true }];

    @field({ type: UsersNew, isArray: true })
    users: [UsersNew];
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
    value: { type: number, required: true };

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
    email: { type: boolean, required: true };

    @field({ type: GraphQLTypesMap.String, isArray: true })
    push: [{ type: boolean, required: true }];
}



@input()
export class UsersNewInput {
    @field({ type: GraphQLTypesMap.String })
    id: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String, isArray: true })
    deliveryMethod: [string];
}


@input()
export class NotificationConfigNewInput {
    @field({ type: GraphQLTypesMap.String, isArray: true })
    notifiOnPercente: [{ type: number, required: true }];

    @field({ type: UsersNewInput, isArray: true })
    users: [UsersNewInput];
}

@input()
export class DateRangeNewInput {
    @field({ type: GraphQLTypesMap.String })
    from: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String })
    to: { type: string, required: true };
}


@input()
export class ReportOptionsNewInput {
    @field({ type: GraphQLTypesMap.String })
    frequency:  { type: string };

    @field({ type: GraphQLTypesMap.String, isArray: true })
    groupings:  [{ type: string }];

    @field({ type: GraphQLTypesMap.String })
    timezone: { type: string, required: true };

    @field({ type: DateRangeNewInput })
    dateRange: DateRangeNewInput;

    @field({ type: GraphQLTypesMap.String })
    filter: { type: string[] };
}


@input()
export class SourceNewInput {
    @field({ type: GraphQLTypesMap.String })
    type: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String })
    identifier: { type: string, required: true };
}


@input()
export class TargetNewInput  {
    @field({ type: GraphQLTypesMap.String })
    name: { type: string, required: true };

    @field({ type: SourceNewInput })
    source: SourceNewInput;

    @field({ type: GraphQLTypesMap.String })
    kpi: { type: string, required: true };

    @field({ type: ReportOptionsNewInput })
    reportOptions: ReportOptionsNewInput;

    @field({ type: GraphQLTypesMap.String })
    compareTo: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String })
    recurrent: { type: boolean, required: true };

    @field({ type: GraphQLTypesMap.String })
    type: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String })
    value: { type: number, required: true };

    @field({ type: GraphQLTypesMap.String })
    unit: { type: string, required: true };

    @field({ type: NotificationConfigNewInput })
    notificationConfig: NotificationConfigNewInput;

    @field({ type: GraphQLTypesMap.String })
    owner: { type: string, required: true };

    @field({ type: GraphQLTypesMap.String })
    active: { type: boolean };

    @field({ type: GraphQLTypesMap.String })
    selected: { type: boolean };

    @field({ type: GraphQLTypesMap.String })
    period: { type: string, required: true };
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

