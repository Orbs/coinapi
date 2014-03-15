'use strict';

// TODO: Do we need this class?
//
var util = require('util');

function ServiceError (error) {
  Error.captureStackTrace(this, ServiceError);
  this.error = error;
}

util.inherits(ServiceError, Error);

ServiceError.prototype.toString = function toString () {
  return 'ServiceError: ' + this.error;
};
