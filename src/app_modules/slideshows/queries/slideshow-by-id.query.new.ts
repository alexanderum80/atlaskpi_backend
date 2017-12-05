
    @injectable()
    @query({
        name: 'slideshowById',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: '_id', type: String, required: true },
        ],
        output: { type: Slideshow }
    })
    export class CreateBusinessUnitMutation extends MutationBase<Slideshow> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<Slideshow> {
            // TODO: Add implementation here
        }
    }
    