import { Game } from '../game';
import { BaseState } from './base-state';
import * as fromErrors from '../errors';

export class AssassinationState extends BaseState {
  toggleVictimProposition(game: Game, assassinsUsername: string, victimsUsername: string) {
    game.playersManager.toggleVictimProposition(
      assassinsUsername,
      victimsUsername,
    );
  }

  assassinate(game: Game, assassinsUsername: string) {
    if (!game.assassinationIsOn()) {
      throw new fromErrors.NoTimeForAssassinationError();
    }

    // TODO: refactor, return boolean
    game.playersManager.assassinate(assassinsUsername);
    game.questsManager.setAssassinationStatus(game._assassinationSucceeded());
  }
}
