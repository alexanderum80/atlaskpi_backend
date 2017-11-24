/**
 * Defines the data returned when an activity is validated before its execution
 */

export interface IValidationResult {
    errors?: [{ code: string, field?: string }];
    success: boolean;
}