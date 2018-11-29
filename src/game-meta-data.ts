import * as crypto from 'crypto';
import { LevelPreset, LevelPresetSerialized } from './level-preset';
import { Player } from './player';

export interface GameMetaDataSerialized {
  id: string;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
  levelPreset: LevelPresetSerialized;
  gameStatus: string;
  gameCreator: string;
}

export enum GameStatus {
  Unfinished = 'Unfinished',
  Won        = 'Won',
  Lost       = 'Lost',
}

export class GameMetaData {
  private id: string               = crypto.randomBytes(20).toString('hex');
  private createdAt: Date          = new Date();
  private startedAt: Date          = null;
  private finishedAt: Date         = null;
  private levelPreset: LevelPreset = LevelPreset.null();
  // TODO: rethink the simultaneous use of `finishedAt` and `gameStatus`
  private gameStatus: GameStatus   = GameStatus.Unfinished;
  private gameCreator: Player      = null;

  setGameStatus(gameStatus: GameStatus) {
    this.gameStatus = gameStatus;
  }

  getGameStatus() {
    return this.gameStatus;
  }

  setCreatorOnce(gameCreator: Player) {
    if (this.gameCreator) return;

    this.gameCreator = gameCreator;
  }

  init(playerCount: number): LevelPreset {
    this.startedAt   = new Date();
    this.levelPreset = new LevelPreset(playerCount);

    return this.levelPreset;
  }

  finish() {
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
