// /**
//  * Google Credentials
//  *
//  * client id: 266039497859-7mlniks5k7tbshan6raeeng6u80euubf.apps.googleusercontent.com
//  * client secret: CmiSLAiEHqq17jjbDanO-p29
//  */
import { importData } from '../../../data/google-spreadsheet/google-sheet.processor';

// import * as fs from 'fs';
// import * as readline from 'readline';
// import * as google from 'googleapis';
// import * as googleAuth from 'google-auth-library';
// import * as Promise from 'bluebird';
// import { ExtendedRequest } from '../../middlewares';
// import * as logger from 'winston';

// import { importData } from './google-sheet.processor';

// let SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
//     process.env.USERPROFILE) + '/.credentials/';
// // let TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
// let TOKEN_PATH = __dirname + '/sheets.googleapis.com-nodejs-quickstart.json';

// export function importSpreadSheet(ctx: IAppModels): Promise<any> {
//     // If modifying these scopes, delete your previously saved credentials
//     // at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json

//     return new Promise<any>((resolve, reject) => {
//         // Load client secrets from a local file.
//         fs.readFile(__dirname + '/client_secret.json', function processClientSecrets(err, content) {
//             if (err) {
//                 console.log('Error loading client secret file: ' + err);
//                 reject(err);
//                 return;
//             }
//             // Authorize a client with the loaded credentials, then call the
//             // Google Sheets API.
//             authorize(JSON.parse(content.toString()), function(auth) {
//                 importData(auth, ctx).then(result => {
//                     resolve(result);
//                 }, err => {
//                     logger.error('There was an error importing data from the google sheets', err);
//                     reject(err);
//                 });
//             } );
//         });
//     });
// }

// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  *
//  * @param {Object} credentials The authorization client credentials.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// function authorize(credentials, callback) {
//     let clientSecret = credentials.installed.client_secret;
//     let clientId = credentials.installed.client_id;
//     let redirectUrl = credentials.installed.redirect_uris[0];
//     let auth = new googleAuth();
//     let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

//     // Check if we have previously stored a token.
//     fs.readFile(TOKEN_PATH, function(err, token) {
//         if (err) {
//             getNewToken(oauth2Client, callback);
//         } else {
//             oauth2Client.credentials = JSON.parse(token.toString());
//             callback(oauth2Client);
//         }
//     });
// }


// /**
//  * Get and store new token after prompting for user authorization, and then
//  * execute the given callback with the authorized OAuth2 client.
//  *
//  * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
//  * @param {getEventsCallback} callback The callback to call with the authorized
//  *     client.
//  */
// function getNewToken(oauth2Client, callback) {
//     let authUrl = oauth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: SCOPES
//     });
//     console.log('Authorize this app by visiting this url: ', authUrl);
//     let rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout
//     });
//     rl.question('Enter the code from that page here: ', function(code) {
//         rl.close();
//         oauth2Client.getToken(code, function(err, token) {
//             if (err) {
//                 console.log('Error while trying to retrieve access token', err);
//                 return;
//             }
//             oauth2Client.credentials = token;
//             storeToken(token);
//             callback(oauth2Client);
//         });
//     });
// }


// /**
//  * Store token to disk be used in later program executions.
//  *
//  * @param {Object} token The token to store to disk.
//  */
// function storeToken(token) {
//     try {
//         fs.mkdirSync(TOKEN_DIR);
//     } catch (err) {
//         if (err.code != 'EEXIST') {
//             throw err;
//         }
//     }
//     fs.writeFile(TOKEN_PATH, JSON.stringify(token));
//     console.log('Token stored to ' + TOKEN_PATH);
// }

import * as Promise from 'bluebird';
import * as fs from 'fs';
import * as readline from 'readline';
import * as google from 'googleapis';
import * as googleAuth from 'google-auth-library';
import * as logger from 'winston';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';

// let TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
const TOKEN_PATH = __dirname + '/sheets.googleapis.com-nodejs-quickstart.json';

export function importSpreadSheet(ctx: any): Promise<any> {
    const that = this;

    return new Promise<any>((resolve, reject) => {
        fs.readFile(__dirname + '/client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                reject(err);
                return;
            }

            // Authorize a client with the loaded credentials, then call the
            // Google Sheets API.
            authorize(JSON.parse(content.toString()), function(auth) {
                // importData
                importData(auth, ctx).then(result => {
                    resolve(result);
                }, (err) => {
                    logger.error('There was an error importing data from from the google sheets', err);
                    reject(err);
                });
            });
        });
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    let clientSecret = credentials.installed.client_secret;
    let clientId = credentials.installed.client_id;
    let redirectUrl = credentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token.toString());
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    let authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}