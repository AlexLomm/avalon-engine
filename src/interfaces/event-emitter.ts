import { GameEvent } from '../enums/game-event';

export interface IEventEmitter {
  emit(event: GameEvent, cb: () => void): void;
}
