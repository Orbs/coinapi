'use strict';

function authenticatedService(path, method) {
  return {
    path: path,
    method: method || 'post',
    auth: true
  };
}

module.exports = {

  // =========== Public API ==============

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
  'prices.buy': 'prices/buy',

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
  'prices.sell': 'prices/sell',

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
  'prices.spot_rate': 'prices/spot_rate',

  // Historical Prices
  //
  //   Returns CSV formatted data
  //
  // Example Results:
  //   2014-02-28T23:47:13-06:00,565.24
  //   2014-02-28T23:37:20-06:00,567.84
  //   2014-02-28T23:26:53-06:00,565.6
  'prices.historical': 'prices/historical',

  'currencies': 'currencies',

  'currencies.exchange_rates': {
    alias: 'currencies.rates',
    path: 'currencies/exchange_rates'
  },

  // =========== Private API ==============

  // Balance
  //
  // Example results:
  //   {
  //     "amount": "36.62800000",
  //     "currency": "BTC"
  //   }
  'account.balance': authenticatedService('account/balance', 'get'),

  'account.receive_address': authenticatedService('account/receive_address', 'get'),

  'account.generate_receive_address': authenticatedService('account/generate_receive_address'),

  'account_changes': {
    alias: 'account.changes',
    path: 'account_changes',
    method: 'get',
    auth: true
  },

  'buttons': authenticatedService('buttons'),

  // TODO: url {{param}} replacement not implemented yet
  'buttons.create_order': authenticatedService('buttons/{{code}}/create_order'),

  'transactions': authenticatedService('transactions', 'get'),

  'transactions.send_money': authenticatedService('transactions/send_money')


};
