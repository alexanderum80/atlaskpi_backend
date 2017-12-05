import { CreateAppointmentMutation, UpdateAppointmentMutation, DeleteAppointmentMutation } from './mutations';
import { AppointmentsQuery } from './queries/appointments.query';
import { AppointmentByIdQuery } from './queries/appointment-by-id.query';
import { AppointmentByDescriptionQuery } from './queries/appointment-by-description.query';
import {
    AppModule, ModuleBase
} from '../../framework';

@AppModule({
    mutations: [
        CreateAppointmentMutation,
        DeleteAppointmentMutation,
        UpdateAppointmentMutation
    ],
    queries: [
        AppointmentByDescriptionQuery,
        AppointmentByIdQuery,
        AppointmentsQuery
    ]
})
export class AppointmentsModule extends ModuleBase { }
