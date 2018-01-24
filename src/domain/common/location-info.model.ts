import { String } from "aws-sdk/clients/configservice";

export interface IOperationHoursInfo {
    day: String;
    from: String;
    to: String;
    fromAMPM: String;
    toAMPM: String;
}

export const OperationHoursInfo = {
    day: {type: String},
    from: {type: String},
    to: {type: String},
    fromAMPM: {type: String},
    toAMPM: {type: String},
};