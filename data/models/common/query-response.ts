export interface IQueryResponse<T> {
    data?: T[] | T;
    errors?: { field: string, errors: string[] }[];
}
