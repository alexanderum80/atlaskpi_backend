export interface IEmploymentInfo {
    location: String;
    bussinessUnit: String;
    department: String;
    position: String;
    startDate: Date;
    typeOfEmployment: String;
    frequency: String;
    rate: String;
}

export const EmploymentInfo = {
    location: {type: String},
    bussinessUnit: {type: String},
    department: {type: String},
    position: {type: String},
    startDate: {type: Date},
    typeOfEmployment: {type: String},
    frequency: {type: String},
    rate: {type: String},
};