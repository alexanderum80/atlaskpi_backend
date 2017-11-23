export interface GraphqlSchema {
    queries: string;
    types: string;
    mutations: string;
}


export interface GraphqlDefinition {
    name: string;
    schema: GraphqlSchema;
    resolvers: any;
}