const _                    = require('lodash');
const errors               = require('../configs/errors.config');
const {roleIds, loyalties} = require('../configs/roles.config');
const Role                 = require('./role');

class PlayersManager {
  constructor() {
    this._levelPreset = null;
    this._gameCreator = null;
    this._players     = [];
    this._leaderIndex = -1;
    this._isSubmitted = false;
  }

  assassinate(assassinsUsername) {
    const assassin = this.getAssassin();
    if (!assassin || assassin.getUsername() !== assassinsUsername) {
      throw new Error(errors.NO_RIGHT_TO_ASSASSINATE);
    }

    const victim = this.getVictim();
    if (!victim) {
      throw new Error(errors.NO_VICTIM_CHOSEN);
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
      throw new Error(errors.USERNAME_ALREADY_EXISTS);
    }

    if (this._players.length === 10) {
      throw new Error(errors.MAXIMUM_PLAYERS_REACHED);
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
      throw new Error(errors.NO_RIGHT_TO_PROPOSE_VICTIM);
    }

    if (this.getAssassin().getUsername() === victimUsername) {
      throw new Error(errors.NO_RIGHT_TO_PROPOSE_HIMSELF);
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
    this._levelPreset = levelPreset;

    const rolesConfig = this._generateRolesConfig(config);

    const roles = this._generateRoles(rolesConfig);

    this._players.forEach((player) => player.setRole(roles.pop()));

    const player = this._players.find(
      (player) => player.getRole().getId() === roleIds.ASSASSIN
    );

    player.markAsAssassin();

    this.nextLeader();
  }

  _generateRolesConfig(config) {
    const defaultRolesConfig = {
      [roleIds.MERLIN]: true,
      [roleIds.ASSASSIN]: true,
    };

    return Object.assign({}, config, defaultRolesConfig);
  }

  _generateRoles(config) {
    let goodCount = this._levelPreset.getGoodCount();
    let evilCount = this._levelPreset.getEvilCount();

    const roles = Object.keys(config).map(roleId => {
      const role = new Role(roleId);

      role.getLoyalty() === loyalties.GOOD
        ? goodCount--
        : evilCount--;

      return role;
    });

    return _.shuffle(_.concat(
      roles,
      this._generateServants(goodCount),
      this._generateMinions(evilCount)
    ));
  }

  _generateServants(count) {
    return _.shuffle([
      new Role(roleIds.SERVANT_1),
      new Role(roleIds.SERVANT_2),
      new Role(roleIds.SERVANT_3),
      new Role(roleIds.SERVANT_4),
      new Role(roleIds.SERVANT_5),
    ]).slice(0, count);
  }

  _generateMinions(count) {
    return _.shuffle([
      new Role(roleIds.MINION_1),
      new Role(roleIds.MINION_2),
      new Role(roleIds.MINION_3),
    ]).slice(0, count);
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
}

module.exports = PlayersManager;
