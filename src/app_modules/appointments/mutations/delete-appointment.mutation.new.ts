
    @injectable()
    @mutation({
        name: 'deleteAppointment',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String, required: true },
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
    