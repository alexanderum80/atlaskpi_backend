import { GraphqlDefinition } from '../graphql-definition';

export const targetGql: GraphqlDefinition = {
    name: 'target',
    schema: {
        types: `
            input TargetInput {
                datepicker: String
                active: Boolean
                vary: String
                amount: String
                type: String
                period: String
                notify: [String]
                visible: [String]
                chart: [String]
            }
            type TargetRepsone {
                datepicker: String
                active: Boolean
                vary: String
                amount: String
                type: String
                period: String
                notify: [String]
                visible: [String]
                chart: [String]
            }
            type TargetResult {
                success: Boolean
                entity: TargetResponse
                errors: [ErrorDetails]
            }
            type TargetQueryResult {
                target: TargetResponse
                errors: [ErrorDetails]
            }
        `,
        queries: `
            findTarget(id: String): TargetQueryResult
            findAllTargets(filter: String): TargetQueryResult
        `,
        mutations: `
            createTarget(data: TargetInput): TargetResult
            updateTarget(id: String, data: TargetInput): TargetResult
            deleteTarget(id: String): TargetResult
        `
    },
    resolvers: {
        Query: {},
        Mutation: {}
    }
};