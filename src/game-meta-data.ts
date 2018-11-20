import * as crypto from 'crypto';
import { LevelPreset } from './level-preset';

export class GameMetaData {
  private id: string               = crypto.randomBytes(20).toString('hex');
  private createdAt: Date          = new Date();
  private levelPreset: LevelPreset = LevelPreset.null();
  private startedAt: Date;
  private finishedAt: Date;

  init(playerCount: number): LevelPreset {
    this.startedAt   = new Date();
    this.levelPreset = new LevelPreset(playerCount);

    return this.levelPreset;
  }

  finish() {
    this.finishedAt = new Date();
  }

  serialize() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      levelPreset: this.levelPreset.serialize(),
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
    };
  }
}
