const levelPresets = require('./level-presets.config');

const LevelPreset = function (playerCount) {
  this.goodCount = levelPresets[playerCount].goodCount;
  this.evilCount = levelPresets[playerCount].evilCount;
  this.quests    = levelPresets[playerCount].quests;
};

LevelPreset.prototype.getGoodCount = function () {
  return this.goodCount;
};

LevelPreset.prototype.getEvilCount = function () {
  return this.evilCount;
};

module.exports = LevelPreset;
