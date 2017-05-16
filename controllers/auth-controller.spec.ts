import { IUserToken } from '../data/models/common';
import * as Promise from 'bluebird';
import * as winston from 'winston';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import { spy } from 'sinon';

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

import { config } from '../config';
import * as jwt from 'jsonwebtoken';
import { getAppContextMock, getAccountModelMock } from '../test';
import { AuthController } from '.';
import { Request, Response } from 'express';
import { IAccountModel, IAccountDocument, IAppModels, IUserDocument } from '../data/models';

function getNewControllerInstance() {
    return new AuthController(getAccountModelMock(), getAppContextMock());
}

describe('AuthController', function() {
    let accountModelMock: IAccountModel;
    let appContextMock: IAppModels;
    let controller: AuthController;

    describe('authenticateUser(hostname, username, password)', function() {

        describe('invalid input', function() {

            beforeEach(function() {
                controller = getNewControllerInstance();
            });

            describe('when hostname is invalid', function() {

                it('specifically "null" should reject with status 400 and "Invalid hostname" message', function(done) {
                    controller.authenticateUser(null, 'username', 'password')
                        .should.eventually.be.rejectedWith('Invalid hostname')
                        .and.have.property('status', 400)
                        .notify(done);
                });

                it('specifically "undefined" should reject with status 400 and "Invalid hostname" message', function(done) {
                    controller.authenticateUser(null, 'username', 'password')
                        .should.eventually.be.rejectedWith('Invalid hostname')
                        .and.have.property('status', 400)
                        .notify(done);
                });

                it('specifically "<empty>" should reject with status 400 and "Invalid hostname" message', function(done) {
                    controller.authenticateUser(null, 'username', 'password')
                        .should.eventually.be.rejectedWith('Invalid hostname')
                        .and.have.property('status', 400)
                        .notify(done);
                });
            });

            describe('when username is invalid', function() {

                it('specifically "null" should reject with status 400 and "Username or password missing" message', function(done) {
                    controller.authenticateUser('host.name.com', null, 'password')
                        .should.eventually.be.rejectedWith('Username or password missing')
                        .and.have.property('status', 400)
                        .notify(done);
                });

                it('specifically "undefined" should reject with status 400 and "Username or password missing" message', function(done) {
                    controller.authenticateUser('host.name.com', undefined, 'password')
                        .should.eventually.be.rejectedWith('Username or password missing')
                        .and.have.property('status', 400)
                        .notify(done);
                });

                it('specifically "<empty>" should reject with status 400 and "Username or password missing" message', function(done) {
                    controller.authenticateUser('host.name.com', '', 'password')
                        .should.eventually.be.rejectedWith('Username or password missing')
                        .and.have.property('status', 400)
                        .notify(done);
                });

            });

            describe('when password is invalid', function() {

                it('should reject with status 400 and "Username or password missing" message', function(done) {
                    controller.authenticateUser('host.name.com', 'username', null)
                        .should.eventually.be.rejectedWith('Username or password missing')
                        .and.have.property('status', 400)
                        .notify(done);
                });
            });
        });

        describe('valid input', function() {
            let findAccountStub: sinon.SinonStub;

            describe('when the account does not exist', function() {
                let stub: sinon.SinonStub;
                let hostname = 'nonexistent.host.name';

                beforeEach(function() {
                    accountModelMock = getAccountModelMock();
                    appContextMock = getAppContextMock();
                    controller = new AuthController(accountModelMock, appContextMock);

                    findAccountStub = (<sinon.SinonStub>accountModelMock.findAccountByHostname);
                    findAccountStub.withArgs(hostname)
                        .returns(new Promise<IAccountDocument>((resolve, reject) => {
                            throw { code: '111', message: 'Account not found' };
                        }));
                });

                it('should go to the database looking for the account', function(done) {
                    controller.authenticateUser(hostname, 'username', 'password')
                        .finally(() => {
                            findAccountStub.should.have.been.calledWith(hostname);
                            done();
                        });
                })

                it('should return account not found', function(done) {
                    controller.authenticateUser(hostname, 'username', 'password')
                        .should.eventually.be.rejectedWith('Account not found')
                        .notify(done);
                });
            });

            describe('when the account exist', function() {
                let hostname: string;
                let username: string;
                let password: string;
                let findOneStub: sinon.SinonStub;

                beforeEach(function() {
                    hostname = 'customer2.domain.com';
                    username = 'username';
                    password = 'password';
                })

                describe('and credentials are incorrect', function() {

                    beforeEach(function() {
                        accountModelMock = getAccountModelMock();
                        appContextMock = getAppContextMock();
                        controller = new AuthController(accountModelMock, appContextMock);

                        findAccountStub = (<sinon.SinonStub>accountModelMock.findAccountByHostname)
                        findAccountStub.withArgs(hostname)
                            .returns(new Promise<IAccountDocument>((resolve, reject) => {
                                resolve(<any>{ name: 'account name' });
                            }));

                        findOneStub = (<sinon.SinonStub>appContextMock.User.findOne);
                        findOneStub.withArgs({ username: username })
                            .returns(new Promise<IUserDocument>((resolve, reject) => {
                                resolve(null);
                            }));
                    });

                    it('should try to validate credentials', function(done) {
                        controller.authenticateUser(hostname, username, password)
                            .catch((err) => {
                                findOneStub.should.have.been.calledWith({ username: username});
                                done();
                            });
                    });

                    it('should return user not found when username is invalid', function(done) {
                        controller.authenticateUser(hostname, username, password)
                            .should.eventually.be.rejectedWith('User not found')
                            .notify(done);
                    });
                });

                describe('and credentials are correct', function() {
                    let comparePasswordStub: sinon.SinonStub;
                    let identity = <any> {
                                    firstName: 'firstName',
                                    middleName: 'middleName',
                                    lastName: 'lastName',
                                    username: 'username',
                                    roles: 'roles',
                                    comparePassword: sinon.stub()
                                        .returns(new Promise<boolean>((resolve, reject) => {
                                            resolve(true);
                                        }))
                                };

                    beforeEach(function() {
                        accountModelMock = getAccountModelMock();
                        appContextMock = getAppContextMock();
                        controller = new AuthController(accountModelMock, appContextMock);

                        findAccountStub = (<sinon.SinonStub>accountModelMock.findAccountByHostname)
                        findAccountStub.withArgs(hostname)
                            .returns(new Promise<IAccountDocument>((resolve, reject) => {
                                resolve(<any>{
                                    name: 'account name',
                                    getConnectionString: sinon.stub().returns('mongodb://localhost/db1'),
                                });
                            }));

                        findOneStub = (<sinon.SinonStub>appContextMock.User.findOne);
                        findOneStub.withArgs({ username: username })
                            .returns(new Promise<IUserDocument>((resolve, reject) => {
                                resolve(identity);
                            }));

                    });

                    it('a token entity should be generated', function(done) {

                        let token = jwt.sign(identity, config.token.secret, {
                            expiresIn: 1440
                        });

                        // we cannot check the entire token that is why we only check the first part
                        let tokenSections = token.split('.');

                        controller.authenticateUser(hostname, username, password)
                            .then((token: IUserToken) => {
                                token.access_token.split('.')[0].should.be.equal(tokenSections[0]);
                                done();
                            });
                    });
                });
            });
        });
    });
});