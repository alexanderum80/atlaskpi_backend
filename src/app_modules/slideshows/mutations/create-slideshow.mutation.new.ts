
    @injectable()
    @mutation({
        name: 'createSlideshow',
        activity: PLEASE-SET-ACTIVITY,
        parameters: [
            { name: 'input', type: SlideshowInput, required: true },
        ],
        output: { type: SlideshowResponse }
    })
    export class CreateBusinessUnitMutation extends MutationBase<SlideshowResponse> {
        constructor(@inject('') private _) {
            super();
        }

        run(data: any): Promise<SlideshowResponse> {
            // TODO: Add implementation here
        }
    }
    