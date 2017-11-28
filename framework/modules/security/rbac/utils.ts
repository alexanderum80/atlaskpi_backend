import * as mongoose from 'mongoose';

export const CAN_ALL = 'all';
export const CAN_ANY = 'any';

export function doCan(type, actionsAndSubjects, done) {
  let role = this;
  role.populate('permissions', function (err, role) {
    if (err) return done(err);
    let count = 0, hasAll = false;
    if (role.permissions) {
      actionsAndSubjects.forEach(function (as) {
        let has = false;
        role.permissions.forEach(function (p) {
          if (p.action === as[0] && p.subject === as[1]) has = true;
        });
        if (has) count++;
      });
    }
    if (type === CAN_ANY) {
      hasAll = (count > 0);
    }
    else {
      hasAll = (count === actionsAndSubjects.length);
    }
    done(null, hasAll);
  });
}

export function resolveRole(context, role, done) {
  if (typeof role === 'string') {
    context.model('Role').findOne({ name: role }, function (err, role) {
      console.log('role found: ' + role);
      if (err) return done(err);
      if (!role) return done(new Error('Unknown role: ' + role));
      done(null, role);
    });
  }
  else {
    done(null, role);
  }
}