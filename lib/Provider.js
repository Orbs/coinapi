'use strict';

// var classtool = require('classtool');
var classi = require('./util/classi');
var _ = require('lodash');
var Service = require('./Service');
var namespace = require('./util/namespace');
var crypto = require('crypto');
var Schemas = require('./Schemas');

function ProviderSpec(bindings) {
  bindings = bindings || {};

  if (!bindings.definition || !bindings.definition.vendor) {
    throw new Error('Invalid provider definition');
  }

  // TOOD: Probably shouldn't require methods at the Provider level
  // Maybe subclass Exchange from Provider and require certain endpoints then
  // if (!_.has(bindings.definition.endpoints, 'account.balance')) {
  //   throw new Error('Missing required Provider API methods');
  // }

  function Provider(props) {

    this.schemas = new Schemas({
      sources: bindings.definition.schemas
    });

    // Configure default options for the request module
    this.requestDefaults = _.extend(
      {
        json: true
      },
      bindings.requestDefaults,
      bindings.definition.requestDefaults
    );

    // Initialize first nonce
    this.nextNonce();

    // Mix the provider definition into instance, excluding vendor and api properties
    _.extend(this, {
      hash: 'sha256',
      digest: 'hex'
    }, _.omit(bindings.definition,'vendor','api','schemas'));

    this.addServices(bindings.definition.vendor,this.vendor,'vendor'); //this.getName());
    this.addServices(bindings.definition.api,this.api,'coinapi');

    // Run the initCredentials() mehtod if provider definition includes one
    this.initCredentials && this.initCredentials(props);

    // TODO: Can we make it so the provider returns a function?
    // The following would be the same:
    //   provider('order.book', cb);
    //   provider.go.order.book(cb);
    //   provider.order.book(cb);
    //
    // var self = this;
    // return function() {
    //   self.go.apply(self, arguments);
    // };
  }

  Provider.prototype.addServices = function(services, context, serviceType) {

    this.services = this.services || [];

    // Instantate a new Service for each service in the definition
    _.each(services, function(def, serviceName) {

      // Use service name and provider name to define a unique class name
      var classKey = this.name + '.' + serviceType + '.' + serviceName;

      // Convert def to an object if it is a string
      if (_.isString(def)) {
        if (serviceType === 'vendor') {
          // For vendor services, value is the service URL path
          def = {
            path: def
          };
        }
        else {
          // For api services, value is name of a vendor service
          def = {
            endpoint: def
          };
        }
      }

      // Find or create the class for this service
      var ServiceClass = Service.find(classKey) || Service.createClass(classKey,{
        definition: def
      });

      // Create an instance of the service class
      var inst = new ServiceClass({
        provider: this,
        // Service instance should have same name as its property key
        name: serviceName
      });

      // Add service name to aliases array
      var aliases = [serviceName];

      // If alias is an array, add it to aliases array
      if (_.isArray(def.alias)) {
        aliases = _.union(aliases, def.alias);
      }
      // If single alias defined, add it array of aliases
      else if (typeof def.alias === 'string') {
        aliases.push(def.alias);
      }

      // Iterate each alias
      _.each(aliases, function(alias) {

        var fullAlias = serviceType + '.' + alias;
        // console.log('addService fullAlias', fullAlias);
        if (this.services[fullAlias]) {
          throw new Error('Duplicate service: '+fullAlias);
        }

        // Add service to provider's hash of services
        this.services[fullAlias] = inst;

        // Add service to API namespace
        namespace(alias, context, function(callback, options) {
          // return inst.send(callback, options);
          return inst.process(callback, options);
        });

      }, this);

    }, this);
  };

  /**
   * Returns the name of this provider.
   *
   * @return {String} name of provider
   */
  Provider.prototype.getName = function() {
    return this.name;
  };

  Provider.prototype.getThrottle = function() {
    return this.throttle || 0;
  };
  Provider.prototype.setThrottle = function(throttle) {
    this.throttle = throttle;
  };

  /**
   * Get base URL for the API of this provider.
   *
   * @return {String} API URL for this provider
   */
  Provider.prototype.getUrl = function() {
    return this.url;
  };

  Provider.prototype.getNonce = function() {
    return this._nonce;
  };
  Provider.prototype.nextNonce = function() {
    this._nonce = ''+(new Date()).getTime() * 1000; // * 1E6
    return this._nonce;
  };
  Provider.prototype.createAuthSignature = function(props) {

    // build message used to create signature
    var message = this.createAuthMessage(props);
    // console.log(message);

    // compute the signature with appropriate hash type (defaults to 'sha256')
    var hmac = crypto.createHmac(this.hash, this.secret); // 'sha256'

    // set encoding to digest type (defaults to 'hex')
    hmac.setEncoding(this.digest); // 'hex'

    // write the text of the hmac digest
    hmac.write(new Buffer(message,'utf8'));

    // end stream so it can then be read from
    hmac.end();

    // read out hmac digest
    var signature = hmac.read();
    return this.uppercaseSignature ? signature.toUpperCase() : signature;
  };

  Provider.prototype._api = function(type, serviceName, callback, options) {
    serviceName = type.name + '.' + (serviceName || '');
    var err = {
      error: type.error,
      service: serviceName
    };
    if (arguments.length < 2) {
      throw new Error(err);
    }
    if (!this.services[serviceName]) {
      if (!callback) {
        throw new Error(err);
      }
      return callback(err);
    }
    return this.services[serviceName].process(callback, options);
    // return this.services[serviceName].send(callback, options);
  };

  Provider.prototype.api = function(serviceName, callback, options) {
    return this._api({
      name: 'coinapi',
      error: 'Valid API method must be specified'
    }, serviceName, callback, options);
  };

  Provider.prototype.vendor = function(serviceName, callback, options) {
    return this._api({
      name: 'vendor', //this.getName(),
      error: 'Valid vendor API method must be specified'
    }, serviceName, callback, options);
  };

  return Provider;
}

module.defineClass(ProviderSpec);

