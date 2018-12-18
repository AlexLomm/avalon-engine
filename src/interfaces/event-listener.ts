import { GameEvent } from '../enums/game-event';

export interface IEventListener {
  on(event: GameEvent, cb: () => void): void;

  off(event: GameEvent, cb: () => void): void;
}
