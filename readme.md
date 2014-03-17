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

- BTC-e
- Huobi
- CampBX
- Bitfinex

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




