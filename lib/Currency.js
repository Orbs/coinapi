'use strict';

var Currency = function(type, amount) {
  this.type = type || 'BTC';
  this.amount = amount || 0.0;
};

Currency.prototype.getType = function() {
};
Currency.prototype.setAmount = function() {
};
Currency.prototype.getAmount = function() {
};
