import * as Handlebars from 'handlebars';

export enum FormatEnum {
    Undefined,
    Percent,
    Dollar,
    Libra,
    Euro,
}

export function getFormatPropName(format: FormatEnum) {
    switch (format) {
        case FormatEnum.Percent:
            return 'percent';
        case FormatEnum.Dollar:
            return 'dollar';
        case FormatEnum.Dollar:
            return 'dollar';
        case FormatEnum.Libra:
            return 'libra';
        case FormatEnum.Euro:
            return 'euro';
    }
}

const FormatsMap  = {
    percent: '{{v}}%',
    dollar: '${{v}}',
    libra: '£{{v}}',
    euro: '€{{v}}',
};

export class ValueFormatHelper {
    public static ApplyFormat(value: string, format: string): string {
        return String(format).replace('{{v}}', value);
    }
}