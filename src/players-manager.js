const _                    = require('lodash');
const errors               = require('./errors');
const {roleIds, loyalties} = require('../configs/roles.config');
const Role                 = require('./role');

class PlayersManager {
  constructor() {
    // TODO: is out of place
    this._gameCreator = null;
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

    player.toggleTeamProposition();
  }

  setIsSubmitted(isSubmitted) {
    this._isSubmitted = isSubmitted;
  }

  getIsSubmitted() {
    return this._isSubmitted;
  }

  assignRoles(levelPreset, config = {}) {
    const rolesConfig = PlayersManager._generateRolesConfig(config);
    const roles       = PlayersManager._generateRoles(
      rolesConfig,
      levelPreset.getGoodCount(),
      levelPreset.getEvilCount(),
    );

    this._players.forEach((player) => player.setRole(roles.pop()));

    this._initAssassin();

    this.nextLeader();
  }

  static _generateRolesConfig(config) {
    // TODO: convert to an array?
    const defaultRolesConfig = {
      [roleIds.MERLIN]: true,
      [roleIds.ASSASSIN]: true,
    };

    return Object.assign({}, config, defaultRolesConfig);
  }

  static _generateRoles(config, goodCount, evilCount) {
    const roles = Object.keys(config).map(roleId => {
      const role = new Role(roleId);

      role.getLoyalty() === loyalties.GOOD
        ? goodCount--
        : evilCount--;

      return role;
    });

    return _.shuffle(_.concat(
      roles,
      PlayersManager._generateServants(goodCount),
      PlayersManager._generateMinions(evilCount)
    ));
  }

  static _generateServants(count) {
    return _.shuffle([
      new Role(roleIds.SERVANT_1),
      new Role(roleIds.SERVANT_2),
      new Role(roleIds.SERVANT_3),
      new Role(roleIds.SERVANT_4),
      new Role(roleIds.SERVANT_5),
    ]).slice(0, count);
  }

  static _generateMinions(count) {
    return _.shuffle([
      new Role(roleIds.MINION_1),
      new Role(roleIds.MINION_2),
      new Role(roleIds.MINION_3),
    ]).slice(0, count);
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
    return {
      isSubmitted: this._isSubmitted,
      gameCreator: this._gameCreator ? this._gameCreator.serialize() : null,
      players: this._players.map(p => p.serialize()),
    };
  }
}

module.exports = PlayersManager;
