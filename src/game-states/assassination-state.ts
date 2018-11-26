import { Game } from '../game';
import { BaseState } from './base-state';
import * as fromErrors from '../errors';

export class AssassinationState extends BaseState {
  protected resultsConcealed = true;

  toggleVictimProposition(game: Game, assassinsUsername: string, victimsUsername: string) {
    game.getPlayersManager().toggleVictimProposition(
      assassinsUsername,
      victimsUsername,
    );
  }

  assassinate(game: Game, assassinsUsername: string) {
    if (!game.getQuestsManager().assassinationAllowed()) {
      throw new fromErrors.NoTimeForAssassinationError();
    }

    const isSuccessful = game.getPlayersManager().assassinate(assassinsUsername);

    game.getQuestsManager().setAssassinationStatus(isSuccessful);
  }
}
