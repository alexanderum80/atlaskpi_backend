
    @injectable()
    @query({
        name: 'appointmentByDescription',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'from', type: String, required: true },
            { name: 'to', type: String, required: true },
            { name: 'name', type: String, required: true },
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
    