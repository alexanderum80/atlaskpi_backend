import { ExtendedRequest } from '../../../middlewares';
import { IValidationResult } from '../../mutations';

export interface IErrorData {
    code: string;
    args?: any[];
}

export class LocalizedError {

    constructor(public code: string, public message: string) { }

    static fromCode(req: ExtendedRequest, errorData: IErrorData): LocalizedError {
        errorData.args = errorData.args || [];
        return new LocalizedError(errorData.code, req.__(errorData.code, ...errorData.args ));
    }

    static fromValidationResult(req: ExtendedRequest, validationResult: IValidationResult, ...args: any[]): LocalizedError {
        let errors = validationResult.errors.map((error) => req.__(error.code));
        return new LocalizedError('MULTIPLE', errors.toString());
    }
}

