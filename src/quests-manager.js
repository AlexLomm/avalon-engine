const Quest = require('./quest');

const QuestsManager = function () {
  this._levelPreset = null;
  this._quests      = [];
};

QuestsManager.prototype.getAll = function () {
  return this._quests;
};

QuestsManager.prototype.init = function (levelPreset) {
  this._levelPreset = levelPreset;

  this._quests = this._levelPreset.getQuests().map(
    (config) => new Quest(config.playersNeeded, config.failsNeeded)
  );
};

module.exports = QuestsManager;
