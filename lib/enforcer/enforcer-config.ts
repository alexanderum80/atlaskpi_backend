import { IIdentity } from '../../data/models';
import { IActivity, ActivityCollection } from './activity';
// import { EnforcerConfig } from './enforcer-config';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as logger from  'winston';

export interface IEnforcerConfig {
    allow: (identity, activity, cb: (err, authorized) => void) => void;
    deny: (identity, activity, cb: (err, authorized) => void) => void;
    activities: IActivity[];
    addActivity(activity: IActivity): void;
    addActivities(activities: IActivity[]): void;
}

export class EnforcerConfig implements IEnforcerConfig {

    private _allow: (identity, activity, cb: (err, authorized) => void) => void;
    private _deny: (identity, activity, cb: (err, authorized) => void) => void;
    private _activities: IActivity[];

    constructor() {
        this._activities = [];
    }

    set allow(callback: (identity, activity, cb: (err, authorized) => void) => void) {
        this._allow = callback;
    }

    get allow() {
        return this._allow;
    }

    set deny(callback: (identity, activity, cb: (err, authorized) => void) => void) {
        this._deny = callback;
    }

    get deny() {
        return this._deny;
    }

    get activities(): IActivity[] {
        return this._activities;
    }

    addActivity(activity: IActivity): void {
        // make sure activity is not empty
        if (!activity) {
            throw new Error('Enfrocer does not allow empty activities');
        }

        // if the activity does not pass the validation an exception will be thrown
        this._validateActivity(activity);

        this._activities.push(activity);
    }

    addActivities(activities: IActivity[]): void {
        // dp soe validations before saving the activities
        if (!activities) {
            throw new Error('Enforcer does not allow an empty list of activities');
        }

        activities.forEach((activity) => this.addActivity(activity));
    }

    private _validateActivity(activity: IActivity) {
        // make sure all activities have at least a:
        // - can
        // - when method or permissions defined
        let includePermissions = activity.hasPermissions && activity.hasPermissions.length > 0;

        if (!includePermissions && !activity.when) {
            throw new Error(`Activity ${activity.may} does not include permissions or define when callback`);
        }
    }
}

let _enforcerConfig: EnforcerConfig = null;

export function getEnforcerConfig() {
    if (!_enforcerConfig) {
        _enforcerConfig = new EnforcerConfig();
    }

    return _enforcerConfig;
}