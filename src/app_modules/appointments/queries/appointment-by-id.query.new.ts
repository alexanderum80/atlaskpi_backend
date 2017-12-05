
    @injectable()
    @query({
        name: 'appointmentById',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String, required: true },
        ],
        output: { type: Appointment }
    })
    export class CreateBusinessUnitMutation extends MutationBase<Appointment> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<Appointment> {
            // TODO: Add implementation here
        }
    }
    