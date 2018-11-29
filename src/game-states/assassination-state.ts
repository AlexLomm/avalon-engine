import { Game } from '../game';
import { BaseState } from './base-state';
import { GameState, GameEvent } from './game-state-machine';

export class AssassinationState extends BaseState {
  protected resultsConcealed = true;
  protected rolesConcealed   = true;

  toggleVictimProposition(game: Game, assassinsUsername: string, victimsUsername: string) {
    game.getPlayersManager().toggleVictimProposition(
      assassinsUsername,
      victimsUsername,
    );

    game.emit(GameEvent.StateChange);
  }

  assassinate(game: Game, assassinsUsername: string) {
    const state = game.getPlayersManager().assassinate(assassinsUsername)
      ? GameState.GameLost
      : GameState.GameWon;

    game.getFsm().transitionTo(state);
  }
}
