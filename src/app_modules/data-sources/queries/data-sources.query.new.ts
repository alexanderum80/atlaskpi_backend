
    @injectable()
    @query({
        name: 'dataSources',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'filter', type: String },
        ],
        output: { type: DataSourceResponse, isArray: true }
    })
    export class CreateBusinessUnitMutation extends MutationBase<DataSourceResponse[]> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<DataSourceResponse[]> {
            // TODO: Add implementation here
        }
    }
    