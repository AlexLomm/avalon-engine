import * as crypto from 'crypto';
import { LevelPreset } from './level-preset';
import { Player } from './player';
import { GameMetaDataSerialized } from './types/game-meta-data-serialized';
import { GameStatus } from './enums/game-status';
import { LevelPresetId } from './types/level-preset-id';

export class GameMetaData {
  private id: string               = crypto.randomBytes(20).toString('hex');
  private createdAt: Date          = new Date();
  private startedAt: Date          = null;
  private finishedAt: Date         = null;
  private levelPreset: LevelPreset = LevelPreset.null();
  // TODO: rethink the simultaneous use of `finishedAt` and `gameStatus`
  private gameStatus: GameStatus   = GameStatus.Unfinished;
  private gameCreator: Player      = null;

  getGameStatus() {
    return this.gameStatus;
  }

  setCreatorOnce(gameCreator: Player) {
    if (this.gameCreator) return;

    this.gameCreator = gameCreator;
  }

  init(levelPresetId: LevelPresetId): LevelPreset {
    this.startedAt   = new Date();
    this.levelPreset = new LevelPreset(levelPresetId);

    return this.levelPreset;
  }

  finish(gameStatus: GameStatus) {
    this.gameStatus = gameStatus;

    this.finishedAt = new Date();
  }

  serialize(): GameMetaDataSerialized {
    return {
      id: this.id,
      createdAt: this.createdAt ? this.createdAt.toString() : null,
      startedAt: this.startedAt ? this.startedAt.toString() : null,
      finishedAt: this.finishedAt ? this.finishedAt.toString() : null,
      levelPreset: this.levelPreset.serialize(),
      gameStatus: this.gameStatus,
      gameCreator: this.gameCreator ? this.gameCreator.getUsername() : null,
    };
  }
}
