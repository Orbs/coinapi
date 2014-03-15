'use strict';

var Provider = require('./Provider');
var bitstampDef = require('./bitstamp/bitstamp');
var coinbaseDef = require('./coinbase/coinbase');

var BitstampProvider = Provider.createClass({
  definition: bitstampDef
});

var inst = new BitstampProvider({
  key: 'u3pojF0tBfIdlDBtvF42o8Gry6TOGu5M',
  secret: 'FjrAw2TyI8t6seb6dZdrwYAXw1KeJiUg',
  user: '679064'
});
console.log('---bitstamp keys---\n'+inst.getAuthKeys('vendor.balance'));


var CoinbaseProvider = Provider.createClass({
  definition: coinbaseDef
});

inst = new CoinbaseProvider({
  // Simple API key (used by coinbase NPM module)
  apikey: '779ec941efcf6be285ea195f00cd28b5b970941446f59ad1b4a2c02d81150576',
  // Key + Secret (used by Endpoint.getAccessHeaders method)
  key: 'AgFePjn1HFXmknY9',
  secret: 'Kza96ygIsN6DYrCXtrvlYZ59RDKF4yy8'
});
console.log('---coinbase keys---\n'+inst.getAuthKeys('vendor.account.balance'));
