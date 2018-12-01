import * as _ from 'lodash';
import * as fromErrors from './errors';
import { Player } from './player';
import { LevelPreset } from './level-preset';
import { RolesAssigner } from './roles-assigner';
import { PlayersManagerSerialized } from './types/players-manager-serialized';
import { RoleId } from './enums/role-id';

export class PlayersManager {
  private players: Player[]         = [];
  private isSubmitted: boolean      = false;
  private proposedPlayers: Player[] = [];
  private leaderIndex: number       = -1;
  private victim: Player;
  private assassin: Player;

  constructor() {
  }

  assassinate(assassinsUsername: string) {
    if (!this.assassin || this.assassin.getUsername() !== assassinsUsername) {
      throw new fromErrors.DeniedAssassinationError();
    }

    if (!this.victim) {
      throw new fromErrors.RequiredVictimError();
    }

    return this.assassinationSucceeded();
  }

  // TODO: replace the hardcoded value with a config
  private assassinationSucceeded() {
    return this.victim.isMerlin();
  }

  // TODO: remove
  getAll(): Player[] {
    return this.players;
  }

  getProposedPlayersCount(): number {
    return this.proposedPlayers.length;
  }

  add(player: Player) {
    if (!player) return;

    if (this.findPlayer(player.getUsername())) {
      throw new fromErrors.AlreadyExistsPlayerError();
    }

    // TODO: replace the hardcoded value with a config
    if (this.players.length === 10) {
      throw new fromErrors.PlayersMaximumReachedError();
    }

    this.players.push(player);
  }

  private findPlayer(username: string): Player {
    return this.players.find((p) => p.getUsername() === username);
  }

  toggleVictimProposition(
    assassinsUsername: string,
    victimUsername: string,
  ) {
    if (this.assassin.getUsername() !== assassinsUsername) {
      throw new fromErrors.DeniedVictimPropositionError();
    }

    if (this.assassin.getUsername() === victimUsername) {
      throw new fromErrors.DeniedSelfSacrificeError();
    }

    const player = this.findPlayer(victimUsername);

    this.victim = this.victim === player
      ? null
      : player;
  }

  togglePlayerProposition(username: string) {
    const player = this.findPlayer(username);

    if (!player) return;

    const index = this.proposedPlayers.findIndex((p) => p === player);

    index > -1
      ? this.proposedPlayers.splice(index, 1)
      : this.proposedPlayers.push(player);
  }

  setIsSubmitted(isSubmitted: boolean) {
    this.isSubmitted = isSubmitted;
  }

  getIsSubmitted() {
    return this.isSubmitted;
  }

  assignRoles(levelPreset: LevelPreset, roleIds: RoleId[] = []) {
    this.players = new RolesAssigner(
      this.players,
      levelPreset,
    ).assignRoles(roleIds);

    this.assassin = this.players.find(p => p.isAssassin());

    this.nextLeader();
  }

  nextLeader() {
    this.getLeader()
      ? this.chooseNextPlayerAsLeader()
      : this.chooseLeaderRandomly();
  }

  getLeader() {
    return this.players[this.leaderIndex];
  }

  private chooseLeaderRandomly() {
    this.leaderIndex = _.random(0, this.players.length - 1);
  }

  private chooseNextPlayerAsLeader() {
    this.leaderIndex = (this.leaderIndex + 1) % this.players.length;
  }

  questVotingAllowedFor(username: string) {
    const player = this.findPlayer(username);

    return player && this.isProposed(player) && !player.getVote();
  }

  private isProposed(player: Player) {
    return !!this.proposedPlayers.find((p) => p === player);
  }

  teamVotingAllowedFor(username: string) {
    const player = this.findPlayer(username);

    return player && !player.getVote();
  }

  playerPropositionAllowedFor(username: string) {
    const leader = this.getLeader();

    return leader && leader.getUsername() === username;
  }

  generateVote(username: string, voteValue: boolean) {
    const player = this.findPlayer(username);

    if (!player) {
      throw new fromErrors.PlayerMissingError();
    }

    if (player.getVote()) {
      throw new fromErrors.AlreadyVotedError();
    }

    return player.generateVote(voteValue);
  }

  reset() {
    this.setIsSubmitted(false);
    this.resetVotes();
    this.resetPropositions();
  }

  resetVotes() {
    this.players.forEach((player) => player.resetVote());
  }

  private resetPropositions() {
    this.proposedPlayers = [];
  }

  serialize(forPlayerUsername: string, rolesConcealed: boolean): PlayersManagerSerialized {
    const forPlayer = this.findPlayer(forPlayerUsername);
    if (!forPlayer) {
      throw new fromErrors.PlayerMissingError();
    }

    return {
      collection: this.serializePlayers(forPlayer, rolesConcealed),
      proposedPlayerUsernames: this.proposedPlayers.map(p => p.getUsername()),
      leader: PlayersManager.getUsernameOrNull(this.getLeader()),
      isSubmitted: this.isSubmitted,
      victim: PlayersManager.getUsernameOrNull(this.victim),
    };
  }

  private serializePlayers(forPlayer: Player, rolesConcealed: boolean) {
    return this.players.map((p) => {
      const roleRevealed = !rolesConcealed || forPlayer.canSee(p);

      return p.serialize(roleRevealed);
    });
  }

  static getUsernameOrNull(player: Player) {
    return player ? player.getUsername() : null;
  }
}
