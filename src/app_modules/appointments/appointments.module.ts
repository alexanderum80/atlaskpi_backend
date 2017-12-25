import { AppModule, ModuleBase } from '../../framework/decorators/app-module';
import { CreateAppointmentMutation } from './mutations/create-appointment.mutation';
import { DeleteAppointmentMutation } from './mutations/delete-appointment.mutation';
import { UpdateAppointmentMutation } from './mutations/update-appointment.mutation';
import { AppointmentByDescriptionQuery } from './queries/appointment-by-description.query';
import { AppointmentByIdQuery } from './queries/appointment-by-id.query';
import { AppointmentsQuery } from './queries/appointments.query';
import { AppointmentsByDateQuery } from './queries/appointments-by-date.query';


@AppModule({
    mutations: [
        CreateAppointmentMutation,
        DeleteAppointmentMutation,
        UpdateAppointmentMutation
    ],
    queries: [
        AppointmentByDescriptionQuery,
        AppointmentsByDateQuery,
        AppointmentByIdQuery,
        AppointmentsQuery
    ]
})
export class AppointmentsModule extends ModuleBase { }
