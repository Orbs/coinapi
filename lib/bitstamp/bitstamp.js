'use strict';

// Look into using Bitstamp's undocumented streaming API. More can be found here:
// http://www.reddit.com/r/Bitcoin/comments/1r4d6t/bitstamps_streaming_api_and_exploitation/
// http://bitcoin.stackexchange.com/questions/20530/bitstamp-streamline-api-how-to-get-all-contents-of-the-ordebooks

// var trades_socket = io.connect('https://websocket.bitstamp.net:8080/live_trades');
// var orders_socket = io.connect('https://websocket.bitstamp.net:8080/live_orders');

// Blockchain websocket api
// https://github.com/abrkn/blockchain

var _ = require('lodash');
var qs = require('querystring');

module.exports = {
  name: 'bitstamp',
  label: 'Bitstamp',
  url: 'https://www.bitstamp.net/api/',
  schemas: __dirname +'/schemas/',
  currencies: ['USD'],
  assets: ['BTC'],
  uppercaseSignature: true,
  requestDefaults: {
    json: false
  },
  method: 'POST',
  flags: {
    direct: false,
    infinity: false,
    history: false,
    auth: ['key','secret','user'],
    // 600 requests per 10 minutes
    limit: {
      requests: 600,
      timespan: 600
    }
  },
  initCredentials: function(props) {
    this.key = props.key;
    this.secret = props.secret;
    this.user = props.user;
  },
  createAuthMessage: function(url, args, body) {
    return this.nextNonce() + this.user + this.key;
  },
  getAuthKeys: function(service,props) {
    return this.services[service].getOptions(props).body;
  },

  getOptions: function(props) {
    props = props || {};
    props.body = qs.stringify(_.extend({},props.body,props.auth ? {
      'key': this.key,
      'signature': this.createAuthSignature(props),
      'nonce': this.getNonce()
    } : {}));

    if(props.method === 'post') {
      props.headers = {};
      // props.headers['User-Agent'] = 'Mozilla/4.0 (compatible; CoinAPI node.js client)';
      // props.headers['Content-Length'] = props.body.length;
      props.headers['content-type'] = 'application/x-www-form-urlencoded';
    }
    props.json = false;


    return props;
  },
  vendor: require('./vendor'),
  api: require('./api')

};


