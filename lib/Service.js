'use strict';

var classi = require('./util/classi');
var _ = require('lodash');
var request = require('request');
var url = require('url');
var querystring = require('querystring');
var asyncThrottle = require('./util/asyncThrottle');
var fs = require('fs');
var async = require('async');
var transform = require('./util/transform');

// var ZSchema = require('z-schema');
// var validator = new ZSchema();


// var async = require('async');

function ServiceSpec(bindings) {
  bindings = bindings || {};
  if (!bindings.definition) {
    throw new Error('Invalid service definition');
  }
  if (_.isString(bindings.definition)) {
    bindings.definition = {
      path: bindings.definition
    };
  }

  // // Configure schemas for this service
  // var schemas = bindings.definition.schemas || {
  //   request: {},
  //   response: {}
  // };
  // // Iterate over all defined schema types
  // _.each(schemas, function(type) {
  //   // If string, check if a schema file exists
  //   // If string should be a reference to a json schema file to load
  //   if (_.isString(schemas[type]) && fs.existsSync(schemas[type])) {
  //     schemas[type] = require(schemas[type]);
  //   }
  // });

  function Service(props) {

    this.name = props.name;
    this.auth = false;
    this.args = null;
    this.body = null;
    this.method = 'get';
    // this.schemas = schemas;
    this.transforms = {};

    this.provider = props.provider;
    this.throttle = props.throttle;

    // Mix the service definition into this instance, except the action function
    // _.extend(this, _.omit(bindings.definition,'action'));
    _.extend(this, bindings.definition);

    // Configure request module with default options
    this.request = request.defaults(_.extend(
      {},
      this.provider.requestDefaults,
      this.requestDefaults
    ));

    // If throttle is 0 or false, do not wrap action in throttle function
    if (!this.getThrottle()) {
      // Otherwise,  wrap the action function with a throttler
      this.action = asyncThrottle(this.action, this.getThrottle());
    }
  }

  /**
   * Returns the name of this service.
   *
   * @return {String} name of service
   */
  Service.prototype.getName = function() {
    return this.name;
  };

  Service.prototype.getFullName = function(type) {
    return this.provider.getName() + '.' + this.name + (type ? '.' + type : '');
  };

  Service.prototype.getThrottle = function() {
    return this.throttle || this.provider.getThrottle();
  };

  /**
   * Default action implementation
   *
   * @param  {Function} callback [description]
   * @param  {[type]}   props    [description]
   * @return {[type]}            [description]
   */
  Service.prototype.action =  function(callback, props) {
    var accessToken;

    if (props && props.access_token) {
      accessToken = props.access_token;
      delete props.access_token;
    }

    // Pass props through to query
    // As URL params for GET and body params for POST
    if (props && this.method === 'get') {
      props = {
        args: props
      };
    }
    else if (props && this.method === 'post') {
      props = {
        body: props
      };
    }

    if (accessToken) {
      props.access_token = accessToken;
    }

    this.query(callback, props);
  };

  /**
   * Get full URL of this service relative to the base API URL of the provider.
   *
   * @return {String} URL for this service
   */
  Service.prototype.getUrl = function(args) {
    var uri = url.parse(url.resolve(this.provider.getUrl(), this.path || ''));
    uri.query=args;
    return url.format(uri);
  };




  Service.prototype.process = function(done, props) {
    props = props || {};

    // console.log('1. process', this.endpoint);

    // If service defiintion includes an endpoint property, then ignore everything
    // else and defer to the service defined by the endpoint property
    if(this.endpoint) {
      return this.provider.vendor(this.endpoint,done,props);
      // return this.provider.vendor([this.endpoint],validateResponse,props);
    }

    // If service defiintion includes a value property, then ignore everything
    // else and simply return the value property
    if(this.value) {
      // return validateResponse(null, this.value);
      return done(null, this.value);
    }

    async.waterfall([
      // start
      function(next) {
        // console.log('2. start');
        next(null, props);
      },
      // transform request
      _.bind(this._transformRequest,this),
      // validate request
      _.bind(this._validateRequest,this),
      // action
      _.bind(this._action,this),
      // validate response
      _.bind(this._validateResponse,this),
      // transform response
      _.bind(this._transformResponse,this)
    ],
    done
    // function(err, result) {
    //   done(err, result);
    // }
    );

  };

  Service.prototype._transformRequest = function(props, next) {
    // console.log('3. _transformRequest');
    props = transform(this.transforms.request, props);
    next(null, props);
  };
  Service.prototype._validateRequest = function(props, next) {
    var self = this;
    // console.log('4. _validateRequest');
    this._validate(props, this.getFullName('request'), function(err, report) {
      next(err, props);
    });
  };
  Service.prototype._action = function(props, next) {
    // console.log('5. _action');
    // Pass request onto this service's action method
    return this.action.call(this, next, props);
  };
  Service.prototype._validateResponse = function(result, next) {
    var self = this;
    // console.log('6. _validateResponse');
    this._validate(result, this.getFullName('response'), function(err, report) {
      next(err, result);
    });
  };
  Service.prototype._transformResponse = function(result, next) {
    // console.log('7. _transformResponse');
    result = transform(this.transforms.response, result);
    next(null, result);
  };

  Service.prototype._validate = function(data, schemaName, callback) {
    // console.log('A. validate');
    this.provider.schemas.validate(data, schemaName, callback);
  };

  Service.prototype.getOptions = function(props) {
    props = props || {};
    props.auth = _.isUndefined(props.auth) ? this.auth : props.auth;
    props.uri = props.uri || this.getUrl();
    props.args = _.extend({}, this.args, props.args);
    props.body = _.extend({}, this.body, props.body);
    props.method = props.method || this.method || 'GET';

    var options = this.provider.getOptions(props);
    return _.extend(options, {
      uri: props.uri,
      qs: _.extend({},props.args, props.qs),
      body: _.isEmpty(props.body) ? undefined : props.body,
      json: !_.isUndefined(props.json) ? props.json : !_.isUndefined(this.json) ? this.json : true
    });
  };

  Service.prototype.query = function(callback, props) {
    var self = this;
    props = props || {};

    var options = this.getOptions(props);

    // TODO: Remove auth from props since it is used by request module
    options.auth = undefined;

    // if (props.json) {
    //   options.body = options.body ? JSON.stringify(body) : undefined;
    // }

    // options.json = undefined;
    // console.log('options',options);
    console.log('performing request', options.uri);
    function handleResponse(err, resp, json) {
      if (err) {
        return callback(err);
      }
      if (resp.statusCode === 200) {
        return callback(null, json);
      }
      callback({
        error: 'Request failed: ' + self.getUrl(),
        status: resp.statusCode
      });
    }

    this.request(options, handleResponse);
  };

  return Service;
}

module.defineClass(ServiceSpec);

