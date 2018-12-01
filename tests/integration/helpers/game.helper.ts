import * as _ from 'lodash';
import { Game } from '../../../src/game';
import { Player } from '../../../src/player';
import { PlayersManagerHelper } from './players-manager.helper';

export class GameHelper {
  static passQuestsWithResults(game: Game, results: boolean[] = []) {
    results.forEach((result: boolean) => {
      const usernames: string[] = [];

      _.times(
        game.getQuestsManager().getCurrentQuest().getVotesNeededCount(),
        (i) => usernames.push(`user-${i}`),
      );

      GameHelper.proposeAndSubmitTeam(game, usernames);

      GameHelper.voteAllForTeam(game, true);

      GameHelper.voteAllForQuest(game, result);
    });
  }

  static proposeAndSubmitTeam(game: Game, usernames: string[] = []) {
    const leaderUsername = game.getPlayersManager().getLeader().getUsername();

    GameHelper.proposePlayers(game, usernames);

    game.submitTeam(leaderUsername);
  }

  static proposePlayers(game: Game, usernames: string[] = []) {
    const leaderUsername = game.getPlayersManager().getLeader().getUsername();

    usernames.forEach((username) => {
      game.toggleTeammateProposition(leaderUsername, username);
    });
  }

  static voteAllForTeam(game: Game, voteValue: boolean) {
    game.getPlayersManager()
      .getAll()
      .forEach(p => game.voteForTeam(p.getUsername(), voteValue));
  }

  static voteAllForQuest(game: Game, voteValue: boolean) {
    const manager = game.getPlayersManager();

    PlayersManagerHelper.getProposedPlayers(manager)
      .forEach(p => game.voteForQuest(p.getUsername(), voteValue));
  }

  static fillPlayers(game: Game, count: number) {
    _.times(count, (i) => game.addPlayer(new Player(`user-${i}`)));
  }
}
