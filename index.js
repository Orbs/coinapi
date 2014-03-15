'use strict';

module.exports = {
  Provider: require('./lib/Provider'),
  definitions: {
    coinbase: require('./lib/coinbase/coinbase'),
    bitstamp: require('./lib/bitstamp/bitstamp')
  }
};

