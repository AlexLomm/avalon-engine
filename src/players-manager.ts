import * as _ from 'lodash';
import * as fromErrors from './errors';
import { Player } from './player';
import { LevelPreset } from './level-preset';
import { RolesAssigner } from './roles-assigner';
import { RoleId } from './configs/roles.config';

export class PlayersManager {
  private _players: Player[]         = [];
  private _gameCreator: Player;
  private _isSubmitted: boolean      = false;
  private _proposedPlayers: Player[] = [];
  private _leaderIndex: number       = -1;
  private _victim: Player;
  private _isAssassinated: boolean   = false;

  constructor() {
  }

  assassinate(assassinsUsername: string) {
    const assassin = this.getAssassin();
    if (!assassin || assassin.getUsername() !== assassinsUsername) {
      throw new fromErrors.DeniedAssassinationError();
    }

    if (!this._victim) {
      throw new fromErrors.RequiredVictimError();
    }

    this._isAssassinated = true;
  }

  // TODO: remove
  getVictim(): Player {
    return this._victim;
  }

  // TODO: make private
  isAssassinated(player: Player): boolean {
    return this._victim === player && this._isAssassinated;
  }

  // TODO: make private
  getAssassin(): Player {
    return this._players.find((p) => p.isAssassin());
  }

  // TODO: remove
  getAll(): Player[] {
    return this._players;
  }

  // TODO: remove
  getProposedPlayers(): Player[] {
    return this._proposedPlayers;
  }

  // TODO: remove
  getGameCreator(): Player {
    return this._gameCreator;
  }

  add(player: Player) {
    if (!player) return;

    if (this._findPlayer(player.getUsername())) {
      throw new fromErrors.AlreadyExistsPlayerError();
    }

    if (this._players.length === 10) {
      throw new fromErrors.PlayersMaximumReachedError();
    }

    if (!this._gameCreator) {
      this._gameCreator = player;
    }

    this._players.push(player);
  }

  _findPlayer(username: string): Player {
    return this._players.find((p) => p.getUsername() === username);
  }

  toggleVictimProposition(
    assassinsUsername: string,
    victimUsername: string,
  ) {
    if (this.getAssassin().getUsername() !== assassinsUsername) {
      throw new fromErrors.DeniedVictimPropositionError();
    }

    if (this.getAssassin().getUsername() === victimUsername) {
      throw new fromErrors.DeniedSelfSacrificeError();
    }

    const player = this._findPlayer(victimUsername);

    this._victim = this._victim === player
      ? null
      : player;
  }

  togglePlayerProposition(username: string) {
    const player = this._findPlayer(username);

    if (!player) return;

    const index = this._proposedPlayers.findIndex((p) => p === player);

    index > -1
      ? this._proposedPlayers.splice(index, 1)
      : this._proposedPlayers.push(player);
  }

  setIsSubmitted(isSubmitted: boolean) {
    this._isSubmitted = isSubmitted;
  }

  getIsSubmitted() {
    return this._isSubmitted;
  }

  assignRoles(levelPreset: LevelPreset, roleIds: RoleId[]) {
    this._players = new RolesAssigner(
      this._players,
      levelPreset,
    ).assignRoles(roleIds);

    this.nextLeader();
  }

  nextLeader() {
    this.getLeader()
      ? this._chooseNextPlayerAsLeader()
      : this._chooseLeaderRandomly();
  }

  getLeader() {
    return this._players[this._leaderIndex];
  }

  _chooseLeaderRandomly() {
    this._leaderIndex = _.random(0, this._players.length - 1);
  }

  _chooseNextPlayerAsLeader() {
    this._leaderIndex = (this._leaderIndex + 1) % this._players.length;
  }

  questVotingAllowedFor(username: string) {
    const player = this._findPlayer(username);

    return player && this._isProposed(player) && !player.getVote();
  }

  _isProposed(player: Player) {
    return !!this._proposedPlayers.find((p) => p === player);
  }

  teamVotingAllowedFor(username: string) {
    const player = this._findPlayer(username);

    return player && !player.getVote();
  }

  playerPropositionAllowedFor(username: string) {
    const leader = this.getLeader();

    return leader && leader.getUsername() === username;
  }

  vote(username: string, voteValue: boolean) {
    const player = this._findPlayer(username);

    if (!player) return;

    return player.vote(voteValue);
  }

  resetVotes() {
    this._players.forEach((player) => player.resetVote());
  }

  resetPropositions() {
    this._proposedPlayers = [];
  }

  serializeFor(forPlayerUsername: string, votesRevealed: boolean) {
    const forPlayer = this._findPlayer(forPlayerUsername);
    if (!forPlayer) {
      throw new fromErrors.PlayerMissingError();
    }

    return {
      players: this._serializePlayers(forPlayer, votesRevealed),
      proposedPlayerUsernames: this._proposedPlayers.map(p => p.getUsername()),
      gameCreatorUsername: PlayersManager._getUsernameOrNull(this._gameCreator),
      leaderUsername: PlayersManager._getUsernameOrNull(this.getLeader()),
      isSubmitted: this._isSubmitted,
      victimUsername: PlayersManager._getUsernameOrNull(this.getVictim()),
      isAssassinated: this._isAssassinated,
    };
  }

  _serializePlayers(forPlayer: Player, votesRevealed: boolean) {
    return this._players.map((p) => {
      const roleRevealed = forPlayer.canSee(p);

      return p.serialize(roleRevealed, votesRevealed);
    });
  }

  static _getUsernameOrNull(player: Player) {
    return player ? player.getUsername() : null;
  }
}
