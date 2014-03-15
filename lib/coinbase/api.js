/*jshint camelcase: false */

'use strict';

var _ = require('lodash');
var async = require('async');

module.exports = {

  // =========== Public API ==============


  // Markets supported by this provider
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
    // }
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

  // Buy Price
  //
  // Props
  //   {
  //     qty: 1
  //   }
  //
  // Example results:
  //   {
  //       "subtotal": {
  //           "amount": "558.82",
  //           "currency": "USD"
  //       },
  //       "fees": [
  //           {
  //               "coinbase": {
  //                   "amount": "5.59",
  //                   "currency": "USD"
  //               }
  //           },
  //           {
  //               "bank": {
  //                   "amount": "0.15",
  //                   "currency": "USD"
  //               }
  //           }
  //       ],
  //       "total": {
  //           "amount": "564.56",
  //           "currency": "USD"
  //       },
  //       "amount": "564.56",
  //       "currency": "USD"
  //   }
  'prices.buy': {
    action: function(callback, props) {
      var opts = {};
      props = props || {};
      // Transform props.currency values, exclude if value is default
      if (!_.isUndefined(props.qty) && props.qty !== 1) {
        opts.args = {
          qty: props.qty
        };
      }
      this.provider.vendor.prices.buy(callback, opts);
    }
  },

  // Sell Price
  //
  // Props
  //   {
  //     qty: 1
  //   }
  //
  // Example results:
  //   {
  //     "subtotal": {
  //       "amount": "9.90",
  //       "currency": "USD"
  //     },
  //     "fees": [
  //       {
  //         "coinbase": {
  //           "amount": "0.10",
  //           "currency": "USD"
  //         }
  //       },
  //       {
  //         "bank": {
  //           "amount": "0.15",
  //           "currency": "USD"
  //         }
  //       }
  //     ],
  //     "total": {
  //       "amount": "9.65",
  //       "currency": "USD"
  //     },
  //     "amount": "9.65",
  //     "currency": "USD"
  //   }
  'prices.sell': {
    action: function(callback, props) {
      var opts = {};
      props = props || {};
      // Transform props.currency values, exclude if value is default
      if (!_.isUndefined(props.qty) && props.qty !== 1) {
        opts.args = {
          qty: props.qty
        };
      }
      this.provider.vendor.prices.sell(callback, opts);
    }
  },

  // Spot Rate Price
  //
  // Props:
  //   {
  //     currency: 'USD'
  //   }
  //
  // Example results:
  //   {
  //       "amount": "554.21",
  //       "currency": "USD"
  //   }
  'prices.spot': {
    action: function(callback, props) {
      var opts = {};
      props = props || {};
      // Transform props.currency values, exclude if value is default
      if (!_.isUndefined(props.currency) && props.currency !== 'USD') {
        opts.args = {
          currency: props.currency
        };
      }
      this.provider.vendor.prices.spot_rate(callback, opts);
    }
  },

  // Historical Prices
  //
  //   Returns CSV formatted data
  //
  // Example Results:
  //   2014-02-28T23:47:13-06:00,565.24
  //   2014-02-28T23:37:20-06:00,567.84
  //   2014-02-28T23:26:53-06:00,565.6
  'prices.historical': 'prices.historical',

  // Ticker
  //
  //   This does not have a corresponding Coinbase endpoint. Multiple endpoints are queried
  //   and values are mapped into the ticker structure. These endpoints are queried in parallel
  //   for best performance.
  //
  //   Note that parellel queries only work with public API calls since requests that include a
  //   nonce must be issued in the proper order. If the underlying endpoints are altered to be
  //   performed as an authenticated user, then this method may return invalid results.
  //
  'ticker': {
    action: function(callback, props) {
      var provider = this.provider;

      // Run in parallel since these are unauthenticated calls and no nonce is required.
      async.parallel({
        'buy': function(cb) {
          // Get buy price
          provider.api.prices.buy(cb);
        },
        'sell': function(cb) {
          // Get sell price
          provider.api.prices.sell(cb);
        },
        'spot': function(cb) {
          // Get spot price
          provider.api.prices.spot(cb);
        }
      },
      function(err, results) {
        // All parallel requests are completed

        if (err) {
          callback(err);
          return;
        }

        // TODO: Figure out how to best make results compatible with bitstamp format
        // curl  https://www.bitstamp.net/api/ticker/
        // {"high": "552.06", "last": "511.85", "timestamp": "1393360683", "bid": "512.74", "volume": "111843.08583672", "low": "400.00", "ask": "514.86"}
        callback && callback(err, {
          timestamp: (new Date()).getTime(),
          high: results.buy.amount,
          low: results.sell.amount,
          ask: results.buy.amount,
          bid: results.sell.amount,
          last: results.spot.amount
          // vendor: results
        });
      });
    }
  },

  'currencies': 'currencies',

  'currencies.rates': 'currencies.exchange_rates',

  // =========== Private API ==============

  // Balance
  //
  // Example results:
  //   {
  //     "amount": "36.62800000",
  //     "currency": "BTC"
  //   }
  'account.balance': 'account.balance',

  'account.receiveAddress': 'account.receive_address',

  'account.receiveAddress.create': {
    action: function(callback, props) {
      // TODO: Must include props.api_key
      // Optionally should include and address containing callback_url and label.
      //  { api_key: '', address: { callback_url: '', label: '' }
      this.provider.vendor.account.generate_receive_address(callback, props);
    }
  },

  'account.changes': 'account_changes',

  'buttons.create': 'buttons',

  'buttons.order.create': 'buttons.create_order'

};
