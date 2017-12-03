
// export interface IErrorData {
//     code: string;
//     args?: any[];
// }

// export class LocalizedError {

//     constructor(public code: string, public message: string) { }

//     static fromCode(req: ExtendedRequest, errorData: IErrorData): LocalizedError {
//         errorData.args = errorData.args || [];
//         return new LocalizedError(errorData.code, (<any>req).__(errorData.code, ...errorData.args ));
//     }

//     static fromValidationResult(req: ExtendedRequest, validationResult: IValidationResult, ...args: any[]): LocalizedError {
//         let errors = validationResult.errors.map((error) => (<any>req).__(error.code));
//         return new LocalizedError('MULTIPLE', errors.toString());
//     }
// }

