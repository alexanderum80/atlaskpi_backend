
    @injectable()
    @mutation({
        name: 'updateWidget',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'id', type: String, required: true },
            { name: 'input', type: WidgetInput, required: true },
        ],
        output: { type: WidgetMutationResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<WidgetMutationResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<WidgetMutationResponse> {
            // TODO: Add implementation here
        }
    }
    