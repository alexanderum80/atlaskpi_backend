import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { resolver } from '../../framework/decorators/resolver.decorator';


@input()
export class SalesInput  {
    @field({ type: GraphQLTypesMap.String })
    source: string;

    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    location: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    customer: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    from: string;

    @field({ type: GraphQLTypesMap.String })
    to: string;

    @field({ type: GraphQLTypesMap.String })
    employee: string;

}

@type()
export class EmployeeSales {
    @field({ type: GraphQLTypesMap.String })
    fullName: string;

    @field({ type: GraphQLTypesMap.String })
    role: string;

    @field({ type: GraphQLTypesMap.String })
    type: string; // full time (f), part time (p)

    @field({ type: GraphQLTypesMap.Int })
    workedTime: number; // in seconds
}

@type()
export class ProductSales {
    @field({ type: GraphQLTypesMap.String })
    itemCode: string;

    @field({ type: GraphQLTypesMap.String })
    itemDescription: string;

    @field({ type: GraphQLTypesMap.Float })
    quantity: number;

    @field({ type: GraphQLTypesMap.Float })
    unitPrice: number;

    @field({ type: GraphQLTypesMap.Float })
    tax: number;

    @field({ type: GraphQLTypesMap.Float })
    tax2: number;

    @field({ type: GraphQLTypesMap.Float })
    amount: number;

    @field({ type: GraphQLTypesMap.Float })
    paid: number;

    @field({ type: GraphQLTypesMap.Float })
    discount: number;

    @field({ type: GraphQLTypesMap.String })
    from: Date;

    @field({ type: GraphQLTypesMap.String })
    to: Date;

}

@type()
export class Sale  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    source: string;

    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    location: string;

    @field({ type: GraphQLTypesMap.String })
    customer: string;

    @field({ type: EmployeeSales })
    employee: EmployeeSales[];

    @field({ type: ProductSales })
    product: ProductSales[];

    @field({ type: GraphQLTypesMap.String })
    category: string;

}

@type()
export class SalesAmountSource {
    @field({ type: GraphQLTypesMap.Float })
    count: number;

    @field({ type: GraphQLTypesMap.Float })
    amount: number;

    @field({ type: GraphQLTypesMap.String })
    source: string;

}

@type()
export class SalesAmount {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: SalesAmountSource, isArray: true })
    revenueSources: SalesAmountSource[];

    @field({ type: GraphQLTypesMap.Float })
    total: number;

    @field({ type: GraphQLTypesMap.Int })
    totalCount: number;

    @field({ type: GraphQLTypesMap.String })
    employee: string;

}

@type()
export class MonthAvgSalesAmountId {
    @field({ type: GraphQLTypesMap.String })
    source: string;
}

@type()
export class MonthAvgSalesAmount {
    @field({ type: MonthAvgSalesAmountId })
    _id: MonthAvgSalesAmountId;

    @field({ type: GraphQLTypesMap.Float })
    amount: number;
}

@type()
export class ExpensesConcept {
    @field({ type: GraphQLTypesMap.String })
    concept: string;

    @field({ type: GraphQLTypesMap.Float })
    amount: number;

}

@type()
export class ExpensesAmount {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.Float })
    amount: number;

    @field({ type: ExpensesConcept, isArray: true })
    expenses: ExpensesConcept[];

    @field({ type: GraphQLTypesMap.Int })
    count: number;

    @field({ type: GraphQLTypesMap.Float })
    total: number;

    @field({ type: GraphQLTypesMap.String })
    employee: string;

}

@type()
export class UsersActivity {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    timestamp: string;

    @field({ type: GraphQLTypesMap.String })
    accessBy: string;

    @field({ type: GraphQLTypesMap.String })
    event: string;

    @field({ type: GraphQLTypesMap.String })
    eventType: string;

    @field({ type: GraphQLTypesMap.String })
    payload: string;


}

@type()
export class ActivitiesMutationResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Sale })
    entity?: Sale;

    @field({ type: ErrorDetails, isArray: true })
    errors?: ErrorDetails[];

}

