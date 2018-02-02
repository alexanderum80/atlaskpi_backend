
import * as fs from 'fs';

export function readTemplate(modelName: string, name: string) {
    return fs.readFileSync(__dirname + '/' + modelName + '/templates/' + name + '.template.hbs', 'utf8');
}
