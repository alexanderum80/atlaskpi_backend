import { type } from '../../framework/decorators/type.decorator';
import { input } from '../../framework/decorators/input.decorator';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { ErrorDetails } from '../../framework/graphql/common.types';

@input()
export class EmploymentInfoInput  {
    @field({ type: GraphQLTypesMap.String })
    location: string;

    @field({ type: GraphQLTypesMap.String })
    bussinessUnit: string;

    @field({ type: GraphQLTypesMap.String })
    department: string;

    @field({ type: GraphQLTypesMap.String })
    position: string;

    @field({ type: GraphQLTypesMap.String })
    startDate: string;

    @field({ type: GraphQLTypesMap.String })
    typeOfEmployment: string;

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

    @field({ type: GraphQLTypesMap.String })
    rate: string;

}


@input()
export class AddressInput  {
    @field({ type: GraphQLTypesMap.String })
    street1: string;

    @field({ type: GraphQLTypesMap.String })
    street2: string;

    @field({ type: GraphQLTypesMap.String })
    city: string;

    @field({ type: GraphQLTypesMap.String })
    state: string;

    @field({ type: GraphQLTypesMap.String })
    country: string;

    @field({ type: GraphQLTypesMap.String })
    zipCode: string;

}


@type()
export class EmploymentInfo  {
    @field({ type: GraphQLTypesMap.String })
    location: string;

    @field({ type: GraphQLTypesMap.String })
    bussinessUnit: string;

    @field({ type: GraphQLTypesMap.String })
    department: string;

    @field({ type: GraphQLTypesMap.String })
    position: string;

    @field({ type: GraphQLTypesMap.String })
    startDate: string;

    @field({ type: GraphQLTypesMap.String })
    typeOfEmployment: string;

    @field({ type: GraphQLTypesMap.String })
    frequency: string;

    @field({ type: GraphQLTypesMap.String })
    rate: string;

}

@input()
export class EmployeeAttributesInput  {
    @field({ type: GraphQLTypesMap.String, required: true })
    firstName: string;

    @field({ type: GraphQLTypesMap.String })
    middleName: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    lastName: string;

    @field({ type: GraphQLTypesMap.String })
    email: string;

    @field({ type: GraphQLTypesMap.String })
    primaryNumber: string;

    @field({ type: GraphQLTypesMap.String })
    dob: string;

    @field({ type: GraphQLTypesMap.String })
    nationality: string;

    @field({ type: GraphQLTypesMap.String })
    maritalStatus: string;

    @field({ type: AddressInput })
    address: AddressInput;

    @field({ type: EmploymentInfoInput, isArray: true })
    employmentInfo: EmploymentInfoInput[];

}


@type()
export class Address  {
    @field({ type: GraphQLTypesMap.String })
    street1: string;

    @field({ type: GraphQLTypesMap.String })
    street2: string;

    @field({ type: GraphQLTypesMap.String })
    city: string;

    @field({ type: GraphQLTypesMap.String })
    state: string;

    @field({ type: GraphQLTypesMap.String })
    country: string;

    @field({ type: GraphQLTypesMap.String })
    zipCode: string;

}


@type()
export class Employee  {
    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    firstName: string;

    @field({ type: GraphQLTypesMap.String })
    middleName: string;

    @field({ type: GraphQLTypesMap.String })
    lastName: string;

    @field({ type: GraphQLTypesMap.String })
    email: string;

    @field({ type: GraphQLTypesMap.String })
    primaryNumber: string;

    @field({ type: GraphQLTypesMap.String })
    dob: string;

    @field({ type: GraphQLTypesMap.String })
    nationality: string;

    @field({ type: GraphQLTypesMap.String })
    maritalStatus: string;

    @field({ type: Address })
    address: Address;

    @field({ type: EmploymentInfo, isArray: true })
    employmentInfo: EmploymentInfo[];

}



@type()
export class UpdateEmployeeResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Employee })
    entity: Employee;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class CreateEmployeeResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Employee })
    entity: Employee;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}


@type()
export class DeleteEmployeeResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Employee })
    entity: Employee;

    @field({ type: ErrorDetails, isArray: true })
    errors: ErrorDetails[];

}

