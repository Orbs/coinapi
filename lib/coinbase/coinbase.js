'use strict';

// var Coinbase = require('nodecoinbase');
var Coinbase = require('coinbase');
var qs = require('querystring');
var _ = require('lodash');

module.exports = {
  // Name of this provider
  name: 'coinbase',
  // Display name of this provider
  label: 'Coinbase',
  // Base URL of this provider's API
  url: 'https://coinbase.com/api/v1/',
  // Path to directory containing JSON schemas
  schemas: __dirname +'/schemas/',
  // Currencies supported by this provider
  currencies: ['USD'],
  // Assets supported by this provider
  assets: ['BTC'],
  // Time in milliseconds to delay between requests to same endpoint
  throttle: 0,
  // Overrides for default options of request module
  requestDefaults: {},

  flags: {
    direct: false,
    infinity: false,
    history: false,
    auth: ['key','secret'],
    // Unable to locate any rate limit documentation
    limit: {
      requests: 0,
      timespan: 0
    }
  },

  // Initialize provider, store API keys
  initCredentials: function(props) {
    this.key = props.key;
    this.secret = props.secret;
  },

  // Custom function to build an authorization message per this provider's authentication requirements
  // This message will get signed and the signature will be sent with all private requests
  createAuthMessage: function(props) {
    var args = qs.stringify(props.args);
    return this.nextNonce() + props.uri + (args ? '?'+args : '') + (!_.isEmpty(props.body) ? JSON.stringify(props.body) : '');
  },

  // Utility method to generate a new set of authentication tokens (key, signature, nonce)
  // TODO: Remove or refactor this?
  getAuthKeys: function(service,props) {
    return JSON.stringify(this.services[service].getOptions(props).headers);
  },

  // Custom provider options to be used during each call of the request module
  // This function should build the authentication tokens and add them to options
  getOptions: function(props) {
    props = props || {};

    // If access_token was included, then use it instead of access key and signature
    if(props.access_token) {
      props.qs = props.qs || {};
      props.qs.access_token = props.access_token;
      delete props.access_token;
      return props;
    }

    props.headers = _.extend({}, props.headers, props.auth ? {
      'ACCESS_KEY': this.key,
      'ACCESS_SIGNATURE': this.createAuthSignature(props),
      'ACCESS_NONCE': this.getNonce()
    } : undefined);

    return props;
  },

  // Import this vendor's endpoints
  vendor: require('./vendor'),
  api: require('./api')

};

