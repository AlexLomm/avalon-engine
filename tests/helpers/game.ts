import * as _ from 'lodash';
import { Game } from '../../src/game';
import { PlayersManager } from '../../src/players-manager';
import { RoleId } from '../../src/configs/roles.config';
import { Player } from '../../src/player';

export function passQuestsWithResults(game: Game, results: boolean[] = []) {
  results.forEach((result: boolean) => {
    const usernames: string[] = [];

    _.times(
      game.getQuestsManager().getCurrentQuest().getVotesNeeded(),
      (i) => usernames.push(`user-${i}`),
    );

    proposeAndSubmitTeam(game, usernames);

    voteAllForTeam(game, true);

    voteAllForQuest(game, result);
  });
}

export function proposeAndSubmitTeam(game: Game, usernames: string[] = []) {
  const leaderUsername = game.getPlayersManager().getLeader().getUsername();

  proposePlayers(game, usernames);

  game.submitTeam(leaderUsername);
}

export function proposePlayers(game: Game, usernames: string[] = []) {
  const leaderUsername = game.getPlayersManager().getLeader().getUsername();

  usernames.forEach((username) => {
    game.toggleTeammateProposition(leaderUsername, username);
  });
}

export function voteAllForTeam(game: Game, voteValue: boolean) {
  game.getPlayersManager()
    .getAll()
    .forEach(p => game.voteForTeam(p.getUsername(), voteValue));
}

export function voteAllForQuest(game: Game, voteValue: boolean) {
  game.getPlayersManager()
    .getProposedPlayers()
    .forEach(p => game.voteForQuest(p.getUsername(), voteValue));
}

export function addPlayersToGame(game: Game, count: number) {
  _.times(count, (i) => game.addPlayer(new Player(`user-${i}`)));
}

export function getNonAssassin(playersManager: PlayersManager) {
  return playersManager.getAll().find(
    (p) => p.getUsername() !== playersManager.getAssassin().getUsername(),
  );
}

export function getMerlin(playersManager: PlayersManager) {
  return playersManager.getAll().find(
    (p) => p.getRole().getId() === RoleId.Merlin,
  );
}

export function getNonAssassinNonMerlin(playersManager: PlayersManager) {
  return playersManager.getAll()
    .find(p => {
      return p.getUsername() !== playersManager.getAssassin().getUsername()
        && p.getRole().getId() !== RoleId.Merlin;
    });
}
