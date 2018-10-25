const errors = require('./errors');

const Quest = function (playersNeeded, failsNeeded) {
  if (!playersNeeded || !failsNeeded) {
    throw new Error(errors.INCORRECT_ARGUMENTS);
  }

  this._playersNeeded = playersNeeded;
  this._failsNeeded   = failsNeeded;
  this._status        = -1;
};

Quest.prototype.getPlayersNeeded = function () {
  return this._playersNeeded;
};

Quest.prototype.getFailsNeeded = function () {
  return this._failsNeeded;
};

Quest.prototype.getStatus = function () {
  return this._status;
};

Quest.prototype.fail = function () {
  return this._status = 0;
};

Quest.prototype.succeed = function () {
  return this._status = 1;
};

module.exports = Quest;
