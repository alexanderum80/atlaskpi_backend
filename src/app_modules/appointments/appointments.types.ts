import { IAppointment } from './../../domain/app/appointments/appointment';
import { field } from '../../framework/decorators/field.decorator';
import { GraphQLTypesMap } from '../../framework/decorators/graphql-types-map';
import { input } from '../../framework/decorators/input.decorator';
import { type } from '../../framework/decorators/type.decorator';
import { ErrorDetails } from '../../framework/graphql/common.types';
import { resolver } from '../../framework/decorators/resolver.decorator';
import { Entity } from '../shared/shared.types';

@input()
export class SearchAppointmentCriteriaInput {
    @field ({ type: GraphQLTypesMap.String })
    date?: string;

    @field ({ type: GraphQLTypesMap.String })
    startDate?: string;

    @field ({ type: GraphQLTypesMap.String })
    endDate?: string;

    @field({ type: GraphQLTypesMap.String, isArray: true })
    provider?: string[];

    @field({ type: GraphQLTypesMap.Boolean })
    cancelled?: boolean;

    timezone: string;
}

@input()
export class AppointmentInput  {
    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    source: string;

    @field({ type: GraphQLTypesMap.String})
    reason: string;

    @field({ type: GraphQLTypesMap.String})
    comments: string;

    @field({ type: GraphQLTypesMap.String, required: true })
    from: string;

    @field({ type: GraphQLTypesMap.String })
    to: string;

    @field({ type: GraphQLTypesMap.Int })
    duration: number;

    @field({ type: GraphQLTypesMap.Boolean })
    approved: string;

}

@type()
export class AppointmentEvent {
    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    name: string;

    @field ({type:  GraphQLTypesMap.String })
    color: string;

    @field ({type:  GraphQLTypesMap.String })
    conflictColor: string;

    @field ({type:  GraphQLTypesMap.String })
    cancelledColor: string;
}

@type()
export class AppointmentCustomer {
    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    fullname: string;

    @field ({type:  GraphQLTypesMap.String })
    city: string;

    @field ({type:  GraphQLTypesMap.String })
    state: string;

    @field ({type:  GraphQLTypesMap.String })
    zip: string;

    @field ({type:  GraphQLTypesMap.String })
    gender: string;

    @field ({type:  GraphQLTypesMap.String })
    dob: string;

    @field ({type:  GraphQLTypesMap.String })
    address: string;
}

@type()
export class Appointment  {
    @resolver({ forField: '_id' })
    static convertId(d) {
        return d._id.toString();
    }

    @field({ type: GraphQLTypesMap.String })
    _id: string;

    @field({ type: GraphQLTypesMap.String })
    appointmentType: string;

    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    source: string;

    @field({ type: GraphQLTypesMap.String})
    reason: string;

    @field({ type: GraphQLTypesMap.String})
    comments: string;

    @resolver({ forField: 'from' })
    static fromResolver(d) {
        return (d.from as Date).toISOString();
    }
    @field({ type: GraphQLTypesMap.String, required: true })
    from: string;

    @resolver({ forField: 'to' })
    static toResolver(d) {
        return (d.to as Date).toISOString();
    }
    @field({ type: GraphQLTypesMap.String })
    to: string;

    @field({ type: GraphQLTypesMap.Int })
    duration: number;

    @field({ type: GraphQLTypesMap.Boolean })
    approved: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    checkedIn: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    checkedOut: boolean;

    @field({ type: GraphQLTypesMap.Boolean })
    cancelled: boolean;

    @field({ type: GraphQLTypesMap.String })
    checkedInOn: string;

    @field({ type: GraphQLTypesMap.String })
    checkedOutOn: string;

    @field({ type: GraphQLTypesMap.String })
    cancelledOn: string;

    @field({ type: GraphQLTypesMap.String })
    confirmedOn: string;

    @field({ type: GraphQLTypesMap.String })
    createdOn: string;

    @field({ type: AppointmentCustomer })
    customer: AppointmentCustomer;

    @resolver({ forField: 'customer'})
    static resolveCustomer = (entity: Appointment) => entity.customer

    @field({ type: Entity })
    location: Entity;

    @resolver({ forField: 'location'})
    static resolveLocation = (entity: Appointment) => entity.location

    @field({ type: Entity, isArray: true})
    provider: Entity[];

    @resolver({ forField: 'provider'})
    static resolveProvier = (entity: Appointment) => entity.provider

    @field({ type: AppointmentEvent })
    event: AppointmentEvent;

    @resolver({ forField: 'event' })
    static resolveEvent = (entity: IAppointment) => entity.event
}

@type()
export class AppointmentMutationResponse  {
    @field({ type: GraphQLTypesMap.Boolean })
    success: boolean;

    @field({ type: Appointment })
    entity?: Appointment;

    @field({ type: ErrorDetails, isArray: true })
    errors?: ErrorDetails[];
}

@type()
export class AppointmentProvider  {
    @field({ type: GraphQLTypesMap.String })
    externalId: string;

    @field({ type: GraphQLTypesMap.String })
    name: string ;
}
