const _             = require('lodash');
const errors        = require('./errors');
const RolesAssigner = require('./roles-assigner');

class PlayersManager {
  constructor() {
    this._players         = [];
    this._gameCreator     = null;
    this._isSubmitted     = false;
    this._proposedPlayers = [];
    this._leaderIndex     = -1;
    // TODO: replace with player proposition
    this._victim          = null;
    this._isAssassinated  = false;
  }

  assassinate(assassinsUsername) {
    const assassin = this.getAssassin();
    if (!assassin || assassin.getUsername() !== assassinsUsername) {
      throw new errors.DeniedAssassinationError();
    }

    if (!this._victim) {
      throw new errors.RequiredVictimError();
    }

    this._isAssassinated = true;
  }

  // TODO: remove
  getVictim() {
    return this._victim;
  }

  // TODO: make private
  isAssassinated(player) {
    return this._victim === player && this._isAssassinated;
  }

  // TODO: make private
  getAssassin() {
    return this._players.find((p) => p.isAssassin());
  }

  // TODO: remove
  getAll() {
    return this._players;
  }

  // TODO: remove
  getProposedPlayers() {
    return this._proposedPlayers;
  }

  // TODO: remove
  getGameCreator() {
    return this._gameCreator;
  }

  add(player) {
    if (!player) return;

    if (this._findPlayer(player.getUsername())) {
      throw new errors.AlreadyExistsPlayerError();
    }

    if (this._players.length === 10) {
      throw new errors.PlayersMaximumReachedError();
    }

    if (!this._gameCreator) {
      this._gameCreator = player;
    }

    this._players.push(player);
  }

  _findPlayer(username) {
    return this._players.find((p) => p.getUsername() === username);
  }

  toggleVictimProposition(
    assassinsUsername,
    victimUsername
  ) {
    if (this.getAssassin().getUsername() !== assassinsUsername) {
      throw new errors.DeniedVictimPropositionError();
    }

    if (this.getAssassin().getUsername() === victimUsername) {
      throw new errors.DeniedSelfSacrificeError();
    }

    const player = this._findPlayer(victimUsername);

    this._victim = this._victim === player
      ? null
      : player;
  }

  togglePlayerProposition(username) {
    const player = this._findPlayer(username);

    if (!player) return;

    const index = this._proposedPlayers.findIndex((p) => p === player);

    index > -1
      ? this._proposedPlayers.splice(index, 1)
      : this._proposedPlayers.push(player);
  }

  setIsSubmitted(isSubmitted) {
    this._isSubmitted = isSubmitted;
  }

  getIsSubmitted() {
    return this._isSubmitted;
  }

  assignRoles(levelPreset, config = {}) {
    this._players = new RolesAssigner(
      this._players,
      levelPreset
    ).assignRoles(config);

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

  questVotingAllowedFor(username) {
    const player = this._findPlayer(username);

    return player && this._isProposed(player) && !player.getVote();
  }

  _isProposed(player) {
    return !!this._proposedPlayers.find((p) => p === player);
  }

  teamVotingAllowedFor(username) {
    const player = this._findPlayer(username);

    return player && !player.getVote();
  }

  playerPropositionAllowedFor(username) {
    const leader = this.getLeader();

    return leader && leader.getUsername() === username;
  }

  vote(username, voteValue) {
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

  serializeFor(forPlayerUsername, votesRevealed) {
    const forPlayer = this._findPlayer(forPlayerUsername);
    if (!forPlayer) {
      throw new errors.PlayerMissingError();
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

  _serializePlayers(forPlayer, votesRevealed) {
    return this._players.map((p) => {
      const roleRevealed = forPlayer.canSee(p);

      return p.serialize(roleRevealed, votesRevealed);
    });
  }

  static _getUsernameOrNull(player) {
    return player ? player.getUsername() : null;
  }
}

module.exports = PlayersManager;
