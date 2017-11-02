var pjson = require('./package.json');

var program = require('commander');
var dev = require('./release/release-dev.js');
var prod = require('./release/release-prod.js');
var envValue;

program
    .version('0.1.0')
    .arguments('<env>')
    .action(function (env) {
        envValue = env;
     });

program.parse(process.argv);

if (!envValue) {
    console.log('Please provide the environment you want to release to. Posible values are: dev and prod')
} else {
    switch (envValue) {
        case 'dev':
            dev.release(pjson.version);
            break;
        case 'prod':
            prod.release(pjson.version);
            break;
        default:
            console.error('The environment value that you provided is not valid. Please use: dev or prod');
    }
}
