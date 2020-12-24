import { Game } from '../game';
import { BaseState } from './base-state';
import { GameEvent } from '../enums/game-event';
import { GameState } from '../enums/game-state';

export class AssassinationState extends BaseState {
  protected resultsConcealed = true;
  protected rolesConcealed = true;

  toggleVictimProposition(game: Game, assassinsId: string, victimsId: string) {
    game.getPlayersManager().toggleVictimProposition(assassinsId, victimsId);

    game.emit(GameEvent.StateChange);
  }

  assassinate(game: Game, assassinsId: string) {
    const state = game.getPlayersManager().assassinate(assassinsId)
      ? GameState.GameLost
      : GameState.GameWon;

    game.getFsm().transitionTo(state);
  }
}
