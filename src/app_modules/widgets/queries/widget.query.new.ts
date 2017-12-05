
    @injectable()
    @query({
        name: 'widget',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String, required: true },
        ],
        output: { type: Widget }
    })
    export class CreateBusinessUnitMutation extends MutationBase<Widget> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<Widget> {
            // TODO: Add implementation here
        }
    }
    