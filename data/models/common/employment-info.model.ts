export interface IEmploymentInfo {
    location: String;
    bussinessUnit: String;
    departament: String;
    position: String;
    startDate: Date;
    typeOfEmployment: String;
    frequency: String;
    rate: String;
}

export const EmploymentInfo = {
    location: {type: String},
    bussinessUnit: {type: String},
    departament:{type: String},
    position: {type: String},
    startDate: {type: Date},
    typeOfEmployment: {type: String},
    frequency: {type: String},
    rate: {type: String},
}