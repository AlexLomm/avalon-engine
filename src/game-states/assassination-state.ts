import { Game } from '../game';
import { BaseState } from './base-state';
import { GameState } from './game-state-machine';

export class AssassinationState extends BaseState {
  protected resultsConcealed = true;

  toggleVictimProposition(game: Game, assassinsUsername: string, victimsUsername: string) {
    game.getPlayersManager().toggleVictimProposition(
      assassinsUsername,
      victimsUsername,
    );
  }

  assassinate(game: Game, assassinsUsername: string) {
    const state = game.getPlayersManager().assassinate(assassinsUsername)
      ? GameState.GameLost
      : GameState.GameWon;

    return game.getFsm().transitionTo(state);
  }
}
