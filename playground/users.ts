import { EnrollmentNotification, UserForgotPasswordNotification } from '../services';
import { config } from '../config';

import * as logger from 'winston';
import { getContext } from '../data';

export function playWithUsers() {
    getContext('mongodb://localhost/customer2').then((ctx) => {
        // ctx.User.addEmail('58793095a64a973946d41bfe', 'orlaqp@email.com')
        //     .then((result) => {
        //         if (result.success) {
        //             logger.debug('Email added succesfully');
        //         } else {
        //             logger.error('There was an error adding the new email: unknow');
        //         }
        //     }, (err) => {
        //         logger.error('There was an error adding the new email', err);
        //     });

        // ctx.User.removeEmail('58793095a64a973946d41bfe', 'orlaqp@email.com').then(() => {
        //     console.log('email removed');
        // });

        // ctx.User.verifyEmail('28526d6992944654ef56223b103aef2411fcc606', 'orlando@novapointofsale.com')
        //     .then(() => {
        //         logger.debug('email verified');
        //     }, (err) => {
        //         logger.error('Error verifying email', err);
        //     });

        // ctx.User.changePassword('58798ac5ccf21a407e259c2c', 'password1', 'password')
        //     .then(() => {
        //         logger.debug('password changed');
        //     }, (err) => {
        //         logger.error('Error changing password', err);
        //     });


        // let notifier = new ForgotPasswordNotification(config);
        // ctx.User.forgotPassword('587a82b88145d148864d09f3', notifier, 'mario@email.com')
        //     .then(() => {
        //         logger.debug('Forgot email sent');
        //     }, (err) => {
        //         logger.error('Error forgot password: ', err);
        //     });

        // ctx.User.resetPassword('5ec8e2f69c0acaf84109856427d95edcbc084851', 'newPassword', true)
        //     .then(() => {
        //         logger.debug('Password reset succesfull');
        //     }, (err) => {
        //         logger.error('Error resetting password: ', err);
        //     });

        // let notifier = new EnrollmentNotification(config);
        // ctx.User.sendEnrollmentEmail('587c2c91cf294c582714ad6b', notifier, 'orlaqp@yahoo.com')
        //     .then(() => {
        //         logger.debug('Forgot email sent');
        //     }, (err) => {
        //         logger.error('Error forgot password: ', err);
        //     });

    });
};
