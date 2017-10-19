import * as Handlebars from 'handlebars';

const Formats  = {
    percent: '{{v}}%',
    dollar: '${{v}}',
    libra: '£{{v}}',
    euro: '€{{v}}',
};

export class ValueFormatHelper {
    public static ApplyFormat(value: string, format: string) {
        const template = Handlebars.compile(Formats[format]);
        return template({ v: value });
    }
}