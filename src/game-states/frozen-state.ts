import { BaseState } from './base-state';
import { Game } from '../game';

export class FrozenState extends BaseState {
  protected resultsConcealed = false;

  serialize(game: Game, forUsername: string) {
    return super.serialize(game, forUsername);
  }
}
