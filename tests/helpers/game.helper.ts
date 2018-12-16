import * as _ from 'lodash';
import { Game } from '../../src/game';
import { PlayersManagerHelper } from './players-manager.helper';

export class GameHelper {
  static passQuestsWithResults(game: Game, results: boolean[] = []) {
    results.forEach((result: boolean) => {
      const ids: string[] = [];

      _.times(
        game.getQuestsManager().getCurrentQuest().getVotesNeededCount(),
        (i) => ids.push(`user-${i}`),
      );

      GameHelper.proposeAndSubmitTeam(game, ids);

      GameHelper.voteAllForTeam(game, true);

      GameHelper.voteAllForQuest(game, result);
    });
  }

  static proposeAndSubmitTeam(game: Game, ids: string[] = []) {
    const leaderId = game.getPlayersManager().getLeader().getId();

    GameHelper.proposePlayers(game, ids);

    game.submitTeam(leaderId);
  }

  static proposePlayers(game: Game, ids: string[] = []) {
    const leaderId = game.getPlayersManager().getLeader().getId();

    ids.forEach((id) => {
      game.toggleTeammateProposition(leaderId, id);
    });
  }

  static voteAllForTeam(game: Game, voteValue: boolean) {
    game.getPlayersManager()
      .getAll()
      .forEach(p => game.voteForTeam(p.getId(), voteValue));
  }

  static voteAllForQuest(game: Game, voteValue: boolean) {
    const manager = game.getPlayersManager();

    PlayersManagerHelper.getProposedPlayers(manager)
      .forEach(p => game.voteForQuest(p.getId(), voteValue));
  }

  static fillPlayers(game: Game, count: number) {
    _.times(count, (i) => game.addPlayer(`user-${i}`));
  }
}
