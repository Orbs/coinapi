'use strict';

// BitStamp Endpoint Definitions
//
// Each property defines an endpoint, the key of which is used to call the endpoint using:
//    provider.api(endpointKey, fn, props)
//
// The value of each key can be either a string or an object. If it is a string, then the string value defines the
// path of the API endpoint, excluding the base path defined at the Exchange level. Default values are used for all
// other properties. For example:
//    'balance': 'account/balance'
//
// The value of an endpoint key is an object, the object may contain the following properites. All properties are
// optional, however the 'path' property is typically required. Default values are indicated and may be overridden
// by including the property in the endpoint definition.
//
// The path property is not required if the endpoint does not make any service request and only performs internal
// logic. The path is also not required if the endpoint delegates to one or more other endpoints.
//
// path       [String]    Required*. Path of API endpoint, excluding base path defined at the Exchange level
// alias      [String]    Optional. An alias that can be used to access this endpoint in addition to the key
// action     [Function]  Optional. Logic that is run when this service is called. Default is basic implementation.
// method     [String]    Optional. HTTP method to use, such as 'post' or 'get'. Default is 'get'.
// transforms [Object]    Optional. Transformation rules to normalize API results. Default is empty object.
//     Example:
//         transforms: {
//           // Remove unused property
//           'removeProperty': null,
//           // Rename property
//           'renameProperty': 'newProperyName',
//           // Complex transform
//           'type': function(val, key, data) {
//             return val !== 'post';
//           }.
//           'account': function(val, key, data) {
//             this.account.set(val, {modelMethod: 'transform'});
//             return this.account;
//           }
//         }
// auth       [Boolean]   Optional. True if the API call requires authentication. Default is false.
// args
// body
// provider
// throttle
//

function authenticatedService(path, method) {
  return {
    path: path,
    method: method || 'post',
    auth: true
  };
}

module.exports = {

  // =========== Public API ==============

  // Ticker
  //
  //   curl  https://www.bitstamp.net/api/ticker/
  //
  // Example results:
  //   {
  //     "high": "552.06",
  //     "last": "511.85",
  //     "timestamp": "1393360683",
  //     "bid": "512.74",
  //     "volume": "111843.08583672",
  //     "low": "400.00",
  //     "ask": "514.86"
  //   }
  'ticker': 'ticker/',

  // EUR_USD
  //
  //   curl https://www.bitstamp.net/api/eur_usd/
  //
  // Example results:
  //   {
  //     "sell": "1.3684",
  //     "buy": "1.3796"
  //   }
  'eur_usd': 'eur_usd/',

  // Transactions
  //
  //   curl https://www.bitstamp.net/api/transactions/
  //
  // Example results:
    // [
    //   {"date": "1393360840", "tid": 3775229, "price": "512.00", "amount": "0.30000470"},
    //   {"date": "1393360836", "tid": 3775228, "price": "512.00", "amount": "0.30000440"},
    //   {"date": "1393360836", "tid": 3775227, "price": "512.00", "amount": "0.07400000"},
    //   {"date": "1393360832", "tid": 3775226, "price": "511.99", "amount": "0.13000000"},
    //   ...
    // ]
  'transactions': 'transactions/',

  // Order Book
  //
  //   curl https://www.bitstamp.net/api/order_book/
  //
  // Example results:
  //   {
  //     "timestamp": "1393360727",
  //     "bids": [
  //       ["515.00", "2.39218447"], ["512.74", "0.04600000"], ["512.00", "2.00000000"], ["511.85", "0.89163617"],
  //       ...
  //     ],
  //     "asks": [
  //       ...
  //     ]
  //   }
  'order_book': 'order_book/',

  // =========== Private API ==============

  // Balance
  //
  // Example results:
  //   {
  //     btc_reserved: '1.00000000',
  //     fee: '0.3800',
  //     btc_available: '0',
  //     usd_reserved: '1331.81',
  //     btc_balance: '1.00000000',
  //     usd_balance: '2194.80',
  //     usd_available: '862.99'
  //   }
  'balance': authenticatedService('balance/'),

  // User Transactions
  //
  // Example results:
  //   [
  //     {
  //       usd: '-552.83',
  //       btc: '1.00000000',
  //       btc_usd: '552.83',
  //       order_id: 18275858,
  //       fee: '2.22',
  //       type: 2,
  //       id: 3838242,
  //       datetime: '2014-02-28 21:41:47'
  //     }
  //   ]
  'user_transactions': authenticatedService('user_transactions/'),

  // Open Orders
  //
  // Example results:
  //   [
  //     {
  //       price: '531.34',
  //       amount: '1.00000000',
  //       type: 0,
  //       id: 18290336,
  //       datetime: '2014-03-01 00:21:18'
  //     }
  //   ]
  'open_orders': authenticatedService('open_orders/'),

  // Cancel Order
  //
  'cancel_order': authenticatedService('cancel_order/'),

  // Limit Buy
  //
  'buy': authenticatedService('buy/'),

  // Limit Sell
  //
  'sell': authenticatedService('sell/'),

  // Withdrawal Requests
  //
  'withdrawal_requests': authenticatedService('withdrawal_requests/'),

  // Bitcoin Withdrawal
  //
  'bitcoin_withdrawal': authenticatedService('bitcoin_withdrawal/'),

  // Bitcoin Deposit Address
  //
  // Example results (NOTE original API result is a string, not JSON):
  //   "15Mgx3z4ECFWKmwqMKVbqWfRaYf1QgvsJ2"
  //
  'bitcoin_deposit_address': authenticatedService('bitcoin_deposit_address/'),

  // Unconfirmed BTC
  //
  // Example results:
  // TODO: results have not been confirmed, just a guess based on docs
  //   [
  //     {
  //       amount: '1.00000000',
  //       address: '15Mgx3z4ECFWKmwqMKVbqWfRaYf1QgvsJ2',
  //       confirmations: 2
  //     }
  //   ]
  'unconfirmed_btc': authenticatedService('unconfirmed_btc/'),

  // Ripple Withdrawal
  //
  'ripple_withdrawal': authenticatedService('ripple_withdrawal/'),

  // Ripple Address
  //
  // Example results:
  //   {
  //     address: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B?dt=97428854'
  //   }
  'ripple_address': authenticatedService('ripple_address/')

};
