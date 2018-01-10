import { isArray, extend } from 'lodash';

export function flatten(obj: any, prefix?: string) {
    let propName = (prefix) ? prefix + '.' :  '',
        ret = {};

    for (const attr in obj) {
        if (isArray(obj[attr])) {
            const len = obj[attr].length;
            ret[attr] = obj[attr].join(',');
        }
        else if (typeof obj[attr] === 'object') {
            extend(ret, flatten(obj[attr], propName + attr));
        }
        else {
            ret[propName + attr] = obj[attr];
        }
    }
      return ret;
}