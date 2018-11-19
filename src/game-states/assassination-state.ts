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
    if (!game.questsManager.assassinationAllowed()) {
      throw new fromErrors.NoTimeForAssassinationError();
    }

    const isSuccessful = game.playersManager.assassinate(assassinsUsername);

    game.questsManager.setAssassinationStatus(isSuccessful);
  }
}
