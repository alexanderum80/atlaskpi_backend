
    import { input, type, field, GraphQLTypesMap } from '../../framework';

    
    @input()
    export class ChartFormatDetails {
        @field({ type: GraphQLTypesMap.String, required: true })
        name: string;

        @field({ type: GraphQLTypesMap.String })
        type: string;

        @field({ type: TypeFormatIn })
        typeFormat: TypeFormatIn;

    }
    

    @input()
    export class TypeFormatIn {
        @field({ type: GraphQLTypesMap.String })
        before: string;

        @field({ type: GraphQLTypesMap.String })
        after: string;

        @field({ type: GraphQLTypesMap.String })
        decimal: string;

        @field({ type: GraphQLTypesMap.String })
        formula: string;

    }
    

    @type()
    export class ChartFormatMutationResult  {
        @field({ type: ChartFormat })
        chartFormat: ChartFormat;

        @field({ type: ErrorDetails, isArray: true })
        errors: ErrorDetails[];

    }
    

    @type()
    export class ChartFormatQueryResult  {
        @field({ type: ChartFormat })
        chartFormat: ChartFormat;

        @field({ type: ErrorDetails, isArray: true })
        errors: ErrorDetails[];

    }
    

    @type()
    export class ChartFormatPagedQueryResult  {
        @field({ type: PaginationInfo })
        pagination: PaginationInfo;

        @field({ type: ChartFormat, isArray: true })
        data: ChartFormat[];

    }
    

    @type()
    export class ChartFormat  {
        @field({ type: GraphQLTypesMap.String })
        _id: string;

        @field({ type: GraphQLTypesMap.String })
        name: string;

        @field({ type: GraphQLTypesMap.String })
        type: string;

        @field({ type: TypeFormat })
        typeFormat: TypeFormat;

    }
    

    @type()
    export class TypeFormat {
        @field({ type: GraphQLTypesMap.String })
        before: string;

        @field({ type: GraphQLTypesMap.String })
        after: string;

        @field({ type: GraphQLTypesMap.String })
        decimal: string;

        @field({ type: GraphQLTypesMap.String })
        formula: string;

    }
    
    