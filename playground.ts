console.log('playground');

import * as momentOriginal from 'moment-timezone';

function extendedMoment() {
    const self = momentOriginal() as any;
    self.__proto__ = extendedMoment.prototype;
    return self;
}

extendedMoment.prototype.__proto__ = momentOriginal.prototype;

extendedMoment.prototype.toTzDate = function() {
    return new Date(this.toISOString());
};

const moment = extendedMoment;

main();

function main() {

   const tzs = [ 'Europe/Istanbul', 'Etc/UTC' ];

   for (const t of tzs) {
       printForTz(t);
   }
}

function printForTz(tz: string) {

    const now = moment();

    console.log('original date: ' + now.toDate());

    const from2 = moment().tz(tz).startOf('day');
    const to2 = moment().tz(tz).endOf('day');

    console.log('.format: ' + from2.format());
    console.log('.format: ' + to2.format());

    console.log('.toDate: ' + from2.toDate());
    console.log('.toDate: ' + to2.toDate());

    const f2 = new Date(from2.format());
    const e2 = new Date(to2.format());

    console.log('date: ' + f2);
    console.log('date: ' + e2);

    const f22 = from2.toTzDate();
    const e22 = to2.toTzDate();

    console.log('tzDate: ' + f22);
    console.log('tzDate: ' + e22);

    console.log(' -------- ');

}
