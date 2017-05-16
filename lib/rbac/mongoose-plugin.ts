import * as mongoose from 'mongoose';
import * as async from 'async';

import {
  resolveRole
} from './models/utils';

export function rbacPlugin(schema, options) {
  options || (options = {});

  schema.add({
    roles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }]
  });

  schema.methods.hasRole = function (role, done) {
    let obj = this;
    resolveRole(this, role, function (err, role) {
      if (err) return done(err);
      let hasRole = false;
      obj.roles.forEach(function (existing) {
        if ((existing._id && existing._id.equals(role._id)) ||
          (existing.toString() === role.id)) {
          hasRole = true;
        }
      });
      done(null, hasRole);
    });
  };

  schema.methods.addRole = function (role, done) {
    let obj = this;
    resolveRole(this, role, function (err, role) {
      if (err) return done(err);
      obj.hasRole(role, function (err, has) {
        if (err) return done(err);
        if (has) return done(null, obj);
        obj.roles = [role._id].concat(obj.roles);
        obj.save(done);
      });
    });
  };

  schema.methods.removeRole = function (role, done) {
    let obj = this;
    resolveRole(this, role, function (err, role) {
      obj.hasRole(role.name, function (err, has) {
        if (err) return done(err);
        if (!has) return done(null);
        let index = obj.roles.indexOf(role._id);
        obj.roles.splice(index, 1);
        obj.save(done);
      });
    });
  };

  schema.methods.can = function (action, subject, done) {
    let obj = this;
    obj.populate('roles', function (err, obj) {
      if (err) return done(err);
      let hasPerm = false;
      if (obj.roles) {
        async.forEachSeries(obj.roles, function (role, next) {
          (<any>role).can(action, subject, function (err, has) {
            if (err) return next(err);
            if (has) hasPerm = true;
            next();
          });
        }, function (err) {
          done(err, hasPerm);
        });
      } else {
        done(null, hasPerm);
      }
    });
  };

  schema.methods.canAll = function (actionsAndSubjects, done) {
    let obj = this;
    obj.populate('roles', function (err, obj) {
      if (err) return done(err);
      let count = 0,
        hasAll = false;
      if (obj.roles) {
        async.forEachSeries(actionsAndSubjects, function (as, nextPerm) {
          let found = false;
          async.forEachSeries(obj.roles, function (role, nextRole) {
            (<any>role).can(as[0], as[1], function (err, has) {
              if (err) return nextRole(err);
              if (!found && has) {
                found = true;
                count++;
              }
              nextRole();
            });
          }, function (err) {
            nextPerm(err);
          });
        }, function (err) {
          hasAll = (count === actionsAndSubjects.length);
          done(err, hasAll);
        });
      } else {
        done(null, hasAll);
      }
    });
  };

  schema.methods.canAny = function (actionsAndSubjects, done) {
    let obj = this;
    obj.populate('roles', function (err, obj) {
      if (err) return done(err);
      let hasAny = false;
      if (obj.roles) {
        let iter = 0;
        async.until(
          function () {
            return hasAny || iter === obj.roles.length;
          },
          function (callback) {
            obj.roles[iter].canAny(actionsAndSubjects, function (err, has) {
              if (err) return callback(err);
              if (has) hasAny = true;
              iter++;
              callback();
            });
          },
          function (err) {
            done(err, hasAny);
          });
      } else {
        done(null, hasAny);
      }
    });
  };
}