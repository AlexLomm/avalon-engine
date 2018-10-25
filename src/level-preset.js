const levelPresets = require('./level-presets.config');

const LevelPreset = function (playerCount) {
  this._goodCount = levelPresets[playerCount].goodCount;
  this._evilCount = levelPresets[playerCount].evilCount;
  this._quests    = levelPresets[playerCount].quests;
};

LevelPreset.prototype.getGoodCount = function () {
  return this._goodCount;
};

LevelPreset.prototype.getEvilCount = function () {
  return this._evilCount;
};

LevelPreset.prototype.getQuests = function () {
  return this._quests;
};

module.exports = LevelPreset;
