'use strict';

// TODO: Goal is to throttle async functions. The first time a function is called, it runs normally immediately.
// Typically, the async function will call a callback function when finished.
//
// However, if the funciton is called again before the throttling wait peroid is over, we want to immediately
// call the same callback, passing the same arguments that were called the first time.
//
// This is sort of a combination of memoize along with throttle/debounce, but it isn't quite the same. The closest thing
// I've found is this, but it takes a different approach:
// http://smellegantcode.wordpress.com/2012/01/16/asynchronous-memoization-in-javascript/

module.exports = function(func, wait, callbackArgumentIndex) {
  var timeout;
  var result;
  var callbackArgs;
  var callbackThis;
  var callbackComplete = false;
  var queue = [];

  callbackArgumentIndex = callbackArgumentIndex || 0;

  var processQueue = function() {
    while (queue.length) {
      queue.pop().apply(callbackThis, callbackArgs);
    }
  };

  return function() {
    var context = this;

    // Convert arguments into an array
    var args = Array.prototype.slice.call(arguments, 0);

    // Reset the timeout and callback arguments once timeout occurs
    var later = function() {
      timeout = void(0);
      result = void(0);
      callbackArgs = void(0);
      callbackThis = void(0);
      callbackComplete = false;
    };

    if (!timeout) {
      // No timeout currently active

      // Get reference to original callback
      var callback = args[callbackArgumentIndex];

      // Wrap callback so we can cache arguments it is called with
      args[callbackArgumentIndex] = function() {
        // Cache callback arguments for later use
        callbackArgs = arguments;
        callbackThis = this;
        callbackComplete = true;

        // Call the original callback
        callback.apply(callbackThis, callbackArgs);

        // Execute any queues up calls that took place before this callback got executed
        processQueue();
      };

      // Since no timeout, immediately run the throttled function
      result = func.apply(context, args);
      // Set up a new timeout
      timeout = setTimeout(later, wait || 0);
    }
    else {
      // Already existing timeout, so do not call the function again
      // However, we do want to call the callback, but with the cached
      // results from the previous call
      //
      // Add
      if (callbackComplete) {
        // Call current callback with previous results
        args[callbackArgumentIndex].apply(callbackThis, callbackArgs);
      }
      else {
        // Add function call to queue
        queue.push(args[callbackArgumentIndex]);
      }
    }
    // Return either the actual or cached result
    return result;
  };
};