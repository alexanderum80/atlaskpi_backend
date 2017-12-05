
    @injectable()
    @query({
        name: 'appointments',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'start', type: String, required: true },
            { name: 'end', type: String, required: true },
        ],
        output: { type: Appointment, isArray: true }
    })
    export class CreateBusinessUnitMutation extends MutationBase<Appointment[]> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<Appointment[]> {
            // TODO: Add implementation here
        }
    }
    