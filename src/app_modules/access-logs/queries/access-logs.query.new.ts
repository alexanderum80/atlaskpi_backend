
    @injectable()
    @query({
        name: 'accessLogs',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'filter', type: String },
        ],
        output: { type: AccessLogResponse, isArray: true }
    })
    export class CreateBusinessUnitMutation extends MutationBase<AccessLogResponse[]> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<AccessLogResponse[]> {
            // TODO: Add implementation here
        }
    }
    