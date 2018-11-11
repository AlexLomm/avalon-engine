const errors       = require('../configs/errors.config');
const levelPresets = require('../configs/level-presets.config');

class LevelPreset {
  constructor(playerCount) {
    const levelPreset = levelPresets[playerCount];
    if (!levelPreset) {
      throw new Error(errors.INCORRECT_NUMBER_OF_PLAYERS);
    }

    this._goodCount = levelPresets[playerCount].goodCount;
    this._evilCount = levelPresets[playerCount].evilCount;
    this._quests    = levelPresets[playerCount].quests;
  }

  getGoodCount() {
    return this._goodCount;
  }

  getEvilCount() {
    return this._evilCount;
  }

  getQuestsConfig() {
    return this._quests;
  }

  getPlayerCount() {
    return this._goodCount + this._evilCount;
  }
}

module.exports = LevelPreset;
