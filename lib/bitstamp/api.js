/*jshint camelcase: false */

'use strict';

var _ = require('lodash');

module.exports = {

  // Properties follow this format
  // [String] key : [String|Object] name of endpoint to proxy or definition object

  'ticker': 'ticker',

  'currencies.rates': 'eur_usd',
  // {
  //   // this action method is executed, proxying only happens by explicitly
  //   // calling a vendor service inside the action method
  //   action: function(callback, props) {
  //     // TODO: Transform these results
  //     this.provider.vendor.eur_usd(callback,props);
  //   }
  // },

  'markets': {
    // Logic action that doesn't use an endpoint
    // action: function(callback, props) {
    //   callback(null, [{
    //     name: 'USDBTC',
    //     currency: 'USD',
    //     asset: 'BTC',
    //     // Minimum trade is $1 USD
    //     minimum: {
    //       amount: 1,
    //       unit: 'currency'
    //     }
    //   }]);
    // },
    value: [{
      name: 'USDBTC',
      currency: 'USD',
      asset: 'BTC',
      // Minimum trade is $1 USD
      minimum: {
        amount: 1,
        unit: 'currency'
      }
    }]
  },

  'transactions': {
    endpoint: 'transactions',
    // this action method is executed, proxying only happens by explicitly
    // calling a vendor service inside the action method
    // action: function(callback, props) {
    //   var opts = {};
    //   props = props || {};
    //   // Transform props.timeframe into values of 'minute' or 'hour'
    //   if (!_.isUndefined(props.timeframe)) {
    //     opts.args = {
    //       time: props.timeframe === 'minute' ? 'minute' : 'hour'
    //     };
    //   }
    //   this.provider.vendor.transactions(callback, opts);
    // },
    // // TODO: Add validation support via json-schema
    // Great book on json-schema
    //  http://spacetelescope.github.io/understanding-json-schema/reference/array.html
    // Tools to generate schemas from JSON:
    //  http://www.jsonschema.net/
    // Use one of these libraries:
    //  https://github.com/acornejo/jjv (fastest, some tests fail, no remote loading)
    //  https://github.com/zaggino/z-schema (no tests fail, fairly fast, supports remote loading)
    // Comparison here:
    //  https://rawgithub.com/zaggino/z-schema/master/benchmark/results.html
    //
    schemas: {
      request: require('../schemas/transactions.request.json'),
      response: require('../schemas/transactions.response.json')
    },
    transforms: {
      request: {
        // time: 'timeframe'
      },
      response: {
        tid: 'transactionId'
      }
    }
  },

  // 'orders.book': {
  //   endpoint: 'order_book'
  // },
  'orders.book': {
    action: function(callback, props) {
      var opts = {};
      props = props || {};
      // Transform props.group from true/false into 1/0
      if (!_.isUndefined(props.group)) {
        opts.args = {
          group: props.group ? 1 : 0
        };
      }
      this.provider.vendor.order_book(callback, opts);
    }
  },

  /**
   * If no asset specified, returns array of objects containing asset names and balances.
   * Otherwise returns a single object with balance for specified asset.
   *
   * @param {String} optional name of asset
   * @return {Array|Object} array of asset names and balance objects or a single object
   */
  'account.balance': 'balance',

  'transactions.user': {
    // automatic proxy to the transactions endpoint (action is ignored)
    endpoint: 'user_transactions',
  },

  'orders.open': {
    endpoint: 'open_orders'
  },

  'orders.cancel': {
    endpoint: 'cancel_order'
  },

  'buy': {
    action: function(callback, props) {
      // TODO: Handle props.amount and props.price
      // { amount: props.amount, price: props.price }
      this.provider.vendor.buy(callback, props);
    }
  },

  'sell': {
    action: function(callback, props) {
      // TODO: Handle props.amount and props.price
      // { amount: props.amount, price: props.price }
      this.provider.vendor.sell(callback, props);
    }
  },

  'withdrawal.requests': 'withdrawal_requests',

  'withdrawal.bitcoin': {
    action: function(callback, props) {
      // TODO: Handle props.amount and props.address
      // { amount: props.amount, address: props.address }
      this.provider.vendor.bitcoin_withdrawal(callback, props);
    }
  },

  // Bitcoin Deposit Address
  //
  // Example results (NOTE original API result is a string, not JSON):
  //   "15Mgx3z4ECFWKmwqMKVbqWfRaYf1QgvsJ2"
  // However, this method will return an object:
  //   {
  //     address: '15Mgx3z4ECFWKmwqMKVbqWfRaYf1QgvsJ2'
  //   }
  'account.receiveAddress': {
    action: function(callback, props) {
      // TODO: Support props.format with values of 'text' and 'object'
      // and return either an object or text accordingly, default to object

      // Convert results string into an object
      function cb(err, results) {
        if (!err) {
          results = {
            address: results
          };
        }
        callback(err, results);
      }
      this.provider.vendor.bitcoin_deposit_address(cb, props);
    }
  }

};
