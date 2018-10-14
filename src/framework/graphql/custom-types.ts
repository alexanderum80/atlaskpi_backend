import { GraphQLScalarType, Kind } from 'graphql';

export interface IGraphQLScalarDefinition {
    name: string;
    resolver: GraphQLScalarType;
}

export const dateScalarType: IGraphQLScalarDefinition = {
    name: 'Date',
    resolver: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
          return new Date(value); // value from the client
        },
        serialize(value) {
          return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
          if (ast.kind === Kind.INT) {
            return new Date(ast.value); // ast value is always in string format
          }
          return null;
        },
      }),
};
