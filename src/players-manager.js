const _             = require('lodash');
const errors        = require('./errors');
const {roleIds}     = require('../configs/roles.config');
const RolesAssigner = require('./roles-assigner');

class PlayersManager {
  constructor() {
    this._players         = [];
    this._isSubmitted     = false;
    //
    this._proposedPlayers = [];
    this._leaderIndex     = -1;
    this._gameCreator     = null;
  }

  assassinate(assassinsUsername) {
    const assassin = this.getAssassin();
    if (!assassin || assassin.getUsername() !== assassinsUsername) {
      throw new errors.DeniedAssassinationError();
    }

    const victim = this.getVictim();
    if (!victim) {
      throw new errors.RequiredVictimError();
    }

    victim.markAsAssassinated();
  }

  getVictim() {
    return this._players.find((p) => p.getIsVictim());
  }

  getAssassin() {
    return this._players.find((p) => p.getIsAssassin());
  }

  getAll() {
    return this._players;
  }

  getProposedPlayers() {
    return this._proposedPlayers;
  }

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

    this._players.forEach((p) => {
      p.getUsername() === victimUsername
        ? p.toggleIsVictim()
        : p.setIsVictim(false);
    });
  }

  toggleTeamProposition(username) {
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

    this._initAssassin();

    this.nextLeader();
  }

  _initAssassin() {
    const player = this._players.find(
      (player) => player.getRole().getId() === roleIds.ASSASSIN
    );

    player.markAsAssassin();
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

  setVote(vote) {
    const player = this._findPlayer(vote.getUsername());

    if (!player) return;

    player.setVote(vote);
  }

  resetVotes() {
    this._players.forEach((player) => player.setVote(null));
  }

  resetPropositions() {
    this._proposedPlayers = [];
  }

  serialize() {
    return {
      isSubmitted: this._isSubmitted,
      // TODO: maybe replace with a null object?
      gameCreator: this._gameCreator ? this._gameCreator.serialize() : null,
      players: this._players.map(p => p.serialize()),
    };
  }
}

module.exports = PlayersManager;
