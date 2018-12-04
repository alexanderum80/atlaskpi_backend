
import { injectable } from 'inversify';
import { AggregateStage } from '../../../app_modules/kpis/queries/aggregate';

const pattern = new RegExp('^__[a-z]+[a-z]__$', 'i');

const placeholders = [
    '__from__',
];

export interface IVSAggReplacementOptions {
    [key: string]: any;
}

// walk
function walkAndReplace(obj: any, pattern: RegExp, replacements: IVSAggReplacementOptions) {
    let k, has = Object.prototype.hasOwnProperty.bind(obj);

    for (k in obj) if (has(k)) {
        switch (typeof obj[k]) {
            case 'object':
                walkAndReplace(obj[k], pattern, replacements);
                break;
            case 'string':
                if (pattern.test(obj[k])) {
                    if (!placeholders.includes(obj[k])) throw new Error('virtual source placeholder not supported');
                    obj[k] = replacements[obj[k]];
                }
        }
    }
}

@injectable()
export class VirtualSourceAggregateService {

    constructor() {
    }

    applyReplacements(aggregate: AggregateStage[], replacements: IVSAggReplacementOptions) {
        walkAndReplace(aggregate, pattern, replacements);
        console.log('walk ended');
    }
}