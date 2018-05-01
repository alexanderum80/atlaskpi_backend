/**
 * Information neede to create a new user
 */
export interface ICreateUserDetails {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email: string;
    username?: string;
    timezone?: string;
    password?: string;
    roles?: string[];
    fullname?: string;
}