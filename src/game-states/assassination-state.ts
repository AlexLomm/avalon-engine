import { Game } from '../game';
import { BaseState } from './base-state';
import * as fromErrors from '../errors';
import { RoleId } from '../configs/roles.config';

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

    // TODO: refactor, return boolean
    game.playersManager.assassinate(assassinsUsername);
    game.questsManager.setAssassinationStatus(this._assassinationSucceeded(game));
  }

  _assassinationSucceeded(game: Game) {
    return game.playersManager.getVictim().getRole().getId() === RoleId.Merlin;
  }
}
