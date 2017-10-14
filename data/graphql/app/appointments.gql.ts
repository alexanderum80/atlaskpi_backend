import {
    DeleteAppointmentMutation
} from '../../mutations/app/appointments/delete-appointment.mutation';
import {
    deleteAppointmentActivity
} from '../../../activities/app/appointments/delete-appointment.activity';
import {
    UpdateAppointmentMutation
} from '../../mutations/app/appointments/update-appointment.mutation';
import {
    AppointmentByIdQuery
} from '../../queries/app/appointments/appointment-by-id.query';
import {
    AppointmentByDescriptionQuery
} from '../../queries/app/appointments/appointment-by-description.query';
import {
    AppointmentsQuery
} from '../../queries/app/appointments/appointments.query';
import {
    IMutationResponse
} from '../../models/common';
import {
    CreateAppointmentMutation
} from '../../mutations/app/appointments/create-appointment.mutation';
import {
    GraphqlDefinition
} from '../graphql-definition';
import {
    ExtendedRequest
} from '../../../middlewares';
import {
    IGraphqlContext
} from '../graphql-context';

import * as logger from 'winston';

export const appointmentsGql: GraphqlDefinition = {
    name: 'appointments',
    schema: {
        types: `
            type Appointment {
                _id: String
                from: String
                to: String
                name: String
                description: String
                states: String
            }

            type UpdateAppointmentResponse {
                success: Boolean
                entity: Appointment
                errors: [ErrorDetails]
            }

            type CreateAppointmentResponse {
                success: Boolean
                entity: Appointment
                errors: [ErrorDetails]
            }

            type DeleteAppointmentResponse {
                success: Boolean
                entity: Appointment
                errors: [ErrorDetails]
            }
        `,
        queries: `
            appointments: [Appointment]
            appointmentById(id: String!): Appointment
            appointmentByDescription(from: String!, to:String!, name: String!): Appointment
        `,
        mutations: `
            createAppointment(from: String!, to:String!, name: String!, description: String!, states: String): CreateAppointmentResponse
            updateAppointment(_id: String!, from: String!, to:String!, name: String!, description: String!,  states: String): UpdateAppointmentResponse
            deleteAppointment(_id: String!): DeleteAppointmentResponse
            `,
    },

    resolvers: {
        Query: {

            appointments(root: any, args, ctx: IGraphqlContext) {
                let query = new AppointmentsQuery(ctx.req.identity, ctx.req.appContext.AppointmentModel);
                return ctx.queryBus.run('list-appointments', query, args);
            },
            appointmentById(root: any, args, ctx: IGraphqlContext) {
                let query = new AppointmentByIdQuery(ctx.req.identity, ctx.req.appContext.AppointmentModel);
                return ctx.queryBus.run('appointment-by-id', query, args);
            },
            appointmentByDescription(root: any, args, ctx: IGraphqlContext) {
                let query = new AppointmentByDescriptionQuery(ctx.req.identity, ctx.req.appContext.AppointmentModel);
                return ctx.queryBus.run('appointment-by-description', query, args);
            }
        },
        Mutation: {
            createAppointment(root: any, args, ctx: IGraphqlContext) {
            let mutation = new CreateAppointmentMutation(ctx.req.identity, ctx.req.appContext.AppointmentModel);
            return ctx.mutationBus.run < IMutationResponse > ('create-appointment', ctx.req, mutation, args);
                      },
            updateAppointment(root: any, args, ctx: IGraphqlContext) {
                let mutation = new UpdateAppointmentMutation(ctx.req.identity, ctx.req.appContext.AppointmentModel);
                return ctx.mutationBus.run < IMutationResponse > ('update-appointment', ctx.req, mutation, args);
            },
            deleteAppointment(root: any, args, ctx: IGraphqlContext) {
                let mutation = new DeleteAppointmentMutation(ctx.req.identity, ctx.req.appContext.AppointmentModel);
                return ctx.mutationBus.run < IMutationResponse > ('delete-appointment', ctx.req, mutation, args);
            },
        },
    }
};