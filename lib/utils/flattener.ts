import * as _ from 'lodash';

export function flatten(obj, prefix) {
    let propName = (prefix) ? prefix + '.' :  '',
        ret = {};

    for (const attr in obj) {
        if (_.isArray(obj[attr])) {
            const len = obj[attr].length;
            ret[attr] = obj[attr].join(',');
        }
        else if (typeof obj[attr] === 'object') {
            _.extend(ret, flatten(obj[attr], propName + attr));
        }
        else {
            ret[propName + attr] = obj[attr];
        }
    }
      return ret;
}