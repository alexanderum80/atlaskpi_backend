console.log('playground');

import * as moment from 'moment-timezone';

// function extendedMoment() {
//     const self = momentOriginal() as any;
//     self.__proto__ = extendedMoment.prototype;
//     return self;
// }

// extendedMoment.prototype.__proto__ = momentOriginal.prototype;

// extendedMoment.prototype.toTzDate = function() {
//     return new Date(this.toISOString());
// };

// const moment = extendedMoment;

const toTzDate = (m: moment.Moment): Date => new Date(m.toISOString());

main();

//    const tzs = [ 'Europe/Istanbul', 'Etc/UTC' ];

//    for (const t of tzs) {
//        printForTz(t);
//    }


function main() {
    test1();
}

function test1() {
    const str  = '10/01/2018 22:30';

    const m = moment(str).tz('America/New_York');
    const iso = m.toISOString();

    console.log(iso);
}

function printForTz(tz: string) {

    const now = moment();

    console.log('now date: ' + now.toDate());

    const from2 = moment().tz(tz).startOf('day');
    const to2 = moment().tz(tz).endOf('day');

    console.log('.toDate: ' + from2.toDate());
    console.log('.toDate: ' + to2.toDate());

    console.log('.format: ' + from2.format());
    console.log('.format: ' + to2.format());

    const f2 = new Date(from2.format());
    const e2 = new Date(to2.format());

    console.log('date: ' + f2);
    console.log('date: ' + e2);

    const f22 = toTzDate(from2);
    const e22 = toTzDate(to2);

    console.log('tzDate: ' + f22);
    console.log('tzDate: ' + e22);

    console.log(' -------- ');

}
