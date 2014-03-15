'use strict';

var ZSchema = require('z-schema');
var fs = require('fs');
var path = require('path');
var arrayize = require('arrayize');
var _ = require('lodash');

function Schemas(props) {
  props = props || {};
  // Schema local source directory path or paths
  this.sources = arrayize(props.sources);
  // Additional schema objects not located in the source directory
  this.schemas = props.schemas || {};
  // Create validator instance
  this.validator = new ZSchema();
  // Load all schema files from source directory
  this.load();
}
Schemas.prototype.add = function(schema) {
  this.schemas[schema.id] = schema;
};
Schemas.prototype.init = function(callback) {
  // Use compileSchema to compile all schemas in an array
  this.validator.compileSchema(_.values(this.schemas), callback);
};
Schemas.prototype.validate = function(data, schema, callback) {
  if (!this.schemas[schema]) {
    return callback(null, {});
  }
  // console.log('validating',schema, _.keys(this.schemas));
  this.validator.validate(data, this.schemas[schema], callback);
};
Schemas.prototype.load = function() {
  // Skip if no source directory specified
  if (!this.sources) {
    return;
  }
  var self = this;
  // Iterate over all sources
  _.each(this.sources, function(source) {
    // Read filenames in source directory
    fs.readdirSync(source)
    // Only include JSON files
    .filter(function(filename) {
      return (/\.json$/).test(filename);
    })
    // Iterate over all JSON files in a source directory
    .forEach(function (filename) {
      // Read a file and add it to schemas
      self.add(JSON.parse(fs.readFileSync(path.resolve(source, filename), 'utf8')));
    });
  });
};

module.exports = Schemas;


// ----- TODO: Delete below

/*jshint indent:false*/
/*jshint quotmark:false*/

// var s = new Schemas({
//   sources: __dirname + '/coinbase/schemas/'
// });

// var obj =
// {
//   "subtotal": {
//     "amount": "558.82",
//     "currency": "USD"
//   },
//   "fees": [
//     {
//       "coinbase": {
//         "amount": "5.59",
//         "currency": "USD"
//       }
//     },
//     {
//       "bank": {
//         "amount": "0.15",
//         "currency": "USD"
//       }
//     }
//   ],
//   "total": {
//     "amount": "564.56",
//     "currency": "USD"
//   },
//   "amount": "564.56",
//   "currency": "USD"
// };

// var amt = {
//     "amount": "5.51",
//     "currency": "USD"
// };

// // console.log('before',s.schemas);
// s.init(function(err, results) {
//   // console.log('results', err, results);
//   console.log('after', s.schemas);
//   s.validate(obj, 'coinbase.prices.response', function(err, report) {
//     console.log('prices report',err, report);
//   });
//   s.validate(amt, 'coinbase.amount', function(err, report) {
//     console.log('amt report',err, report);
//   });
// });


