export interface IAddress {
    street1: string;
    street2: string;
    city: string;
    state: string;
    country: string;
    zipCode: string
}

export const Address = {
    street1: { type: String },
    street2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
};
