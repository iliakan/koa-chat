
Error.stackTraceLimit = 1000;
require('trace');
require('clarify');

var chain = require('stack-chain');

chain.filter.attach((error, frames) => {
  return frames.filter((callSite) => {
    var name = callSite && callSite.getFileName();
    return (name && name.indexOf("/co/") == -1);
  });
});
