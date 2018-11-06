const errors       = require('./errors');
const levelPresets = require('./level-presets.config');

const LevelPreset = function (playerCount) {
  const levelPreset = levelPresets[playerCount];
  if (!levelPreset) {
    throw new Error(errors.INCORRECT_NUMBER_OF_PLAYERS);
  }

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

LevelPreset.prototype.getPlayerCount = function () {
  return this._goodCount + this._evilCount;
};

module.exports = LevelPreset;
