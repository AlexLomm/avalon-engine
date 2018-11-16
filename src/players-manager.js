const _             = require('lodash');
const errors        = require('./errors');
const {roleIds}     = require('../configs/roles.config');
const RolesAssigner = require('./roles-assigner');

class PlayersManager {
  constructor() {
    this._players     = [];
    // TODO: is out of place
    this._leaderIndex = -1;
    this._isSubmitted = false;
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
    return this._players.filter((p) => p.getIsProposed());
  }

  getGameCreator() {
    return this._players.find((p) => p.getIsGameCreator());
  }

  add(player) {
    if (!player) return;

    if (this._findPlayer(player.getUsername())) {
      throw new errors.AlreadyExistsPlayerError();
    }

    if (this._players.length === 10) {
      throw new errors.PlayersMaximumReachedError();
    }

    if (!this.getGameCreator()) {
      player.markAsGameCreator();
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

    player.toggleTeamProposition();
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

    this.getLeader().setIsLeader(true);
  }

  _chooseNextPlayerAsLeader() {
    this.getLeader().setIsLeader(false);

    this._leaderIndex = (this._leaderIndex + 1) % this._players.length;

    this.getLeader().setIsLeader(true);
  }

  questVotingAllowedFor(username) {
    const player = this._findPlayer(username);

    return player && player.getIsProposed() && !player.getVote();
  }

  teamVotingAllowedFor(username) {
    const player = this._findPlayer(username);

    return player && !player.getVote();
  }

  teamPropositionAllowedFor(username) {
    return this.playerPropositionAllowedFor(username);
  }

  playerPropositionAllowedFor(username) {
    const leader = this.getLeader();

    if (!leader) return false;

    return leader.getUsername() === username;
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
    this._players.forEach((player) => player.setIsProposed(false));
  }

  serialize() {
    const gameCreator = this.getGameCreator();

    return {
      isSubmitted: this._isSubmitted,
      gameCreator: gameCreator ? gameCreator.serialize() : null,
      players: this._players.map(p => p.serialize()),
    };
  }
}

module.exports = PlayersManager;
