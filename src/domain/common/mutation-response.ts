/**
 * Defines the data returned when a mutation is run
 */

export interface IMutationError {
    field: string;
    errors: string[];
}

export interface IMutationResponse {
    success?: boolean;
    entity?: any;
    errors?: IMutationError[];
}

export class MutationResponse implements IMutationResponse {
    success: boolean;
    entity: any;
    errors: { field: string, errors: string[] }[];

    /**
     * Create a new instance of a Mutation response when there are validation errors
     * I am expecting the error format form the validate library which is:
     * { field: ['error1', 'error2'] }
     */
    static fromValidationErrors(errors: any) {
        let response = new MutationResponse();

        if (!errors) {
            return response;
        }

        response.errors = [];

        Object.keys(errors).forEach((key) => {
            let error = {
                field: key,
                errors: errors[key]
            };

            response.errors.push(error);
        });

        return response;
    }
}

// export interface IMutationResult {
//     errors?: IErrorDetails[];
//     success: boolean;
// }
