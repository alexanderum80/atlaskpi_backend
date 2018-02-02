import { type } from '../../framework/decorators/type.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';


@input()
export class NotifyInput  {
    @field({ type: GraphQLTypesMap.String, isArray: true })
    users: string[];

    @field({ type: GraphQLTypesMap.String })
    notification: string;

}


@input()
export class TargetInput  {
    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field({ type: GraphQLTypesMap.String })
    datepicker: string;

    @field({ type: GraphQLTypesMap.String })
    vary: string;

    @field({ type: GraphQLTypesMap.String })
    amount: string;

    @field({ type: GraphQLTypesMap.Boolean })
    active: boolean;

    @field({ type: GraphQLTypesMap.String })
    amountBy: string;

    @field({ type: GraphQLTypesMap.String })
    type: string;

    @field({ type: GraphQLTypesMap.String })
    period: string;

    @field({ type: NotifyInput })
    notify: NotifyInput;

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


@input()
export class TargetOwner  {
    @field({ type: GraphQLTypesMap.String })
    owner: string;

}

@input()
export class TargetAmountInput {
    @field({ type: GraphQLTypesMap.String })
    amount: string;

    @field({ type: GraphQLTypesMap.String })
    amountBy: string;

    @field({ type: GraphQLTypesMap.String })
    period: string;

    @field({ type: GraphQLTypesMap.String })
    vary: string;

    @field({ type: GraphQLTypesMap.String })
    nonStackName: string;

    @field({ type: GraphQLTypesMap.String })
    stackName: string;

    @field({ type: GraphQLTypesMap.String, isArray: true})
    chart: string[];

    @field({ type: GraphQLTypesMap.String })
    notificationDate: string;
}

@input()
export class NotificationInput {
    @field({ type: GraphQLTypesMap.String, isArray: true })
    usersId: string[];

    @field({ type: GraphQLTypesMap.String })
    targetName: string;

    @field({ type: GraphQLTypesMap.Float })
    targetAmount: number;

    @field({ type: GraphQLTypesMap.Float })
    targetMet: number;

    @field({ type: GraphQLTypesMap.String })
    targetDate: string;

    @field({ type: GraphQLTypesMap.String })
    chartId: string;

    @field({ type: GraphQLTypesMap.String })
    businessUnit: string;
}

@type()
export class NotifyResponse  {
    @field({ type: GraphQLTypesMap.String, isArray: true })
    users: string[];

    @field({ type: GraphQLTypesMap.String })
    notification: string;

}

@type()
export class NotificationResponse {
    @field({ type: GraphQLTypesMap.Boolean })
    success: Boolean;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];
}

@type()
export class TargetResponse  {
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

    @field({ type: NotifyResponse })
    notify: NotifyResponse;

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


@type()
export class TargetRemoveResponse  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

}


@type()
export class TargetResult  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: TargetResponse })
    entity: TargetResponse;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class TargetQueryResult  {
    @field({ type: TargetResponse })
    target: TargetResponse;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class TargetRemoveResult  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: TargetRemoveResponse })
    entity: TargetRemoveResponse;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

@type()
export class TargetAmountResponse {
    @field({ type: GraphQLTypesMap.Float })
    amount: number;

    @field({ type: GraphQLTypesMap.Float })
    met: number;
}