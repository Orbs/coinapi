'use strict';

var _ = require('lodash');

module.exports = function(transforms, data) {
  var self = this;

  function _transform(data) {
    // Transform properties
    _.each(transforms, function(val, key) {
      if (!val) {
        // Delete property if val is falsy
        delete data[key];
      }
      else if (_.isFunction(val)) {
        // Replace value with function result
        data[key] = val.call(self, data[key], key, data);
      }
      else {
        // Rename property
        data[val] = data[key];
        delete data[key];
      }
    });

    // Return transformed entity
    return data;
  }

  if (_.isArray(data)) {
    return _.map(data, _transform, this);
  }
  return _transform(data);

};


