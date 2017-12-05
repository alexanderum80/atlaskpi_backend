
    @injectable()
    @query({
        name: 'previewWidget',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'input', type: WidgetInput },
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
    