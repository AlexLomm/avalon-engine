import { levelPresets, QuestConfig } from './configs/level-presets.config';
import * as fromErrors from './errors';

export class LevelPreset {
  private _goodCount: number;
  private _evilCount: number;
  private _quests: QuestConfig[];

  constructor(playerCount: number) {
    const levelPreset = levelPresets[playerCount];
    if (!levelPreset) {
      throw new fromErrors.PlayersAmountIncorrectError();
    }

    this._goodCount = levelPresets[playerCount].goodCount;
    this._evilCount = levelPresets[playerCount].evilCount;
    this._quests    = levelPresets[playerCount].quests;
  }

  // TODO: cache
  static null() {
    return new LevelPreset(-1);
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

  serialize() {
    return {
      goodCount: this._goodCount,
      evilCount: this._evilCount,
    };
  }
}
