# CoinAPI

CoinAPI is a node.js module for communicating with bitcoin and altcoin service providers. It provides a common API for interacting with various providers. Both request and response objects are normalized into a standard format for easy consumption.

**WARNING:** The architecture and design of CoinAPI is still evolving. Many features are working as expected, but many are not yet complete. You are advised to use at your own risk. This readme will be updated as the project stablizes.

## Features

- Common API for multiple bitcoin providers
- Normalized request and response objects across providers
- Extendable to work with any provider without requiring an accepted pull request
- JSON Schema for all supported provider endpoints
- JSON Schema based validation of both request and response objects
- JSON Schema leveraged during normalization from native API objects to CoinAPI objects
- Sandbox mode to help develop applications without actually making buy, sell, and other real life financial transactions
- Full test suite

## Providers

The APIs of various service providers have been reviewed an analyzed for similar types of functionality. Endpoints of Coinbase, Bitstamp, Kraken, and BTC-e were reviewed. Based on the various endpoint, an attempt has been made to create a common API with consistent and sensible naming scheme.

### Supported providers

- Coinbase
- Bitstamp
- Kraken (coming soon)

### Other providers

In the future, additional providers may get native support in CoinAPI. However, CoinAPI was designed so that any provider can be used by simply creating a provier definition. This definition doesn't need to be included natively with CoinAPI for it to be used.

Providers that get native support include:

- Bitfinex
- BTC-e
- CampBX
- Cryptsy
- Huobi

### Add a provider

To add a provider, a `provider definition` must be created. This definition is primarily a configuration object that defines endpoints, attribute mapping, and any custom logic necessary.

## Installation

```
npm install coinapi
```

## Usage

To create a Provider instance:

```
var coinapi = require('coinapi');
var Provider = coinapi.Provider;

var CoinbaseProvider = Provider.createClass({
  definition: coinapi.definitions.coinbase
});

var coinbase = new CoinbaseProvider({
  key: process.env.COINBASE_API_KEY,
  secret: process.env.COINBASE_API_SECRET
});
```

## CoinAPI Methods

CoinAPI provides a standard set of methods that can be used to call any provider (Coinbase, Bitstamp, etc.). All of these methods are called in the same way, accept the same request data format, and return the same response data format, regardless of which provider is being used. In cases where a provider does not support the method or full data attributes, an appropriate response is returned.

The common methods that will be provided by CoinAPI are currently in flux. As we add more providers, the methods and payloads will solidify. Many of the following proposed methods have been implemented or will soon be available:

```
api.account.balance
api.account.receiveAddress
api.account.receiveAddress.create
api.account.changes
api.buy
api.currencies
api.currencies.rates
api.markets
api.orders
api.orders.create
api.prices.buy
api.prices.sell
api.prices.spot
api.prices.historical
api.sell
api.ticker
api.transactions
api.transactions.send
api.transactions.request
api.transactions.resend
api.transactions.cancel
api.transactions.complete
api.transfers
```

### CoinAPI Examples

```
coinbase.api.ticker(function(err, results) {
  console.log(err, results);
});

coinbase.api.prices.buy(function(err, results) {
  console.log(err, results);
},{
  qty: 5,
  currency: 'EUR'
});

coinbase.api.account.balance(function(err, results) {
  console.log(err, results);
});
```

## Vendor Methods

All vendor-specific endpoints are supported by CoinAPI. They are available on the `vendor` property of the CoinAPI instance. Example vendor calls:

```
coinbase.vendor.generate_receive_address(function(err, results) {
  console.log(err, results);
});

coinbase.vendor.account.balance(function(err, results) {
  console.log(err, results);
});

coinbase.vendor.account_changes(function(err, results) {
  console.log(err, results);
});
```


