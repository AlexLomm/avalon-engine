import { levelPresets, QuestConfig } from './configs/level-presets.config';
import * as fromErrors from './errors';

export interface LevelPresetSerialized {
  goodCount: number;
  evilCount: number;
}

export class LevelPreset {
  private goodCount: number;
  private evilCount: number;
  private quests: QuestConfig[];

  constructor(playerCount: number) {
    const levelPreset = levelPresets[playerCount];
    if (!levelPreset) {
      throw new fromErrors.PlayersAmountIncorrectError();
    }

    this.goodCount = levelPresets[playerCount].goodCount;
    this.evilCount = levelPresets[playerCount].evilCount;
    this.quests    = levelPresets[playerCount].quests;
  }

  // TODO: cache
  static null() {
    return new LevelPreset(-1);
  }

  getGoodCount() {
    return this.goodCount;
  }

  getEvilCount() {
    return this.evilCount;
  }

  getQuestsConfig() {
    return this.quests;
  }

  getPlayerCount() {
    return this.goodCount + this.evilCount;
  }

  serialize(): LevelPresetSerialized {
    return {
      goodCount: this.goodCount,
      evilCount: this.evilCount,
    };
  }
}
