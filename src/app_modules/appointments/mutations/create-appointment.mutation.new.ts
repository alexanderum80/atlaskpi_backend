
    @injectable()
    @mutation({
        name: 'createAppointment',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'input', type: AppointmentInput },
        ],
        output: { type: AppointmentMutationResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<AppointmentMutationResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<AppointmentMutationResponse> {
            // TODO: Add implementation here
        }
    }
    