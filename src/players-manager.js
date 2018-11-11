const _                    = require('lodash');
const errors               = require('./errors');
const {roleIds, loyalties} = require('./roles.config');
const Role                 = require('./role');

const PlayersManager = function () {
  this._levelPreset = null;
  this._gameCreator = null;
  this._players     = [];
  this._leaderIndex = -1;
  this._isSubmitted = false;
};

PlayersManager.prototype.assassinate = function (assassinsUsername) {
  const assassin = this.getAssassin();
  if (!assassin || assassin.getUsername() !== assassinsUsername) {
    throw new Error(errors.NO_RIGHT_TO_ASSASSINATE);
  }

  const victim = this.getVictim();
  if (!victim) {
    throw new Error(errors.NO_VICTIM_CHOSEN);
  }

  victim.markAsAssassinated();
};

PlayersManager.prototype.getVictim = function () {
  return this._players.find((p) => p.getIsVictim());
};

PlayersManager.prototype.getAssassin = function () {
  return this._players.find((p) => p.getIsAssassin());
};

PlayersManager.prototype.getAll = function () {
  return this._players;
};

PlayersManager.prototype.getProposedPlayers = function () {
  return this._players.filter((p) => p.getIsProposed());
};

PlayersManager.prototype.getGameCreator = function () {
  return this._gameCreator;
};

PlayersManager.prototype.add = function (player) {
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
};

PlayersManager.prototype._findPlayer = function (username) {
  return this._players.find((p) => p.getUsername() === username);
};

PlayersManager.prototype.toggleVictimProposition = function (
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
};

PlayersManager.prototype.toggleTeamProposition = function (username) {
  const player = this._findPlayer(username);

  if (!player) return;

  player.toggleTeamProposition();
};

PlayersManager.prototype.setIsSubmitted = function (isSubmitted) {
  this._isSubmitted = isSubmitted;
};

PlayersManager.prototype.getIsSubmitted = function () {
  return this._isSubmitted;
};

PlayersManager.prototype.assignRoles = function (levelPreset, config = {}) {
  this._levelPreset = levelPreset;

  const rolesConfig = this._generateRolesConfig(config);

  const roles = this._generateRoles(rolesConfig);

  this._players.forEach((player) => player.setRole(roles.pop()));

  const player = this._players.find(
    (player) => player.getRole().getId() === roleIds.ASSASSIN
  );

  player.markAsAssassin();

  this.nextLeader();
};

PlayersManager.prototype._generateRolesConfig = function (config) {
  const defaultRolesConfig = {
    [roleIds.MERLIN]: true,
    [roleIds.ASSASSIN]: true,
  };

  return Object.assign({}, config, defaultRolesConfig);
};

PlayersManager.prototype._generateRoles = function (config) {
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
};

PlayersManager.prototype._generateServants = function (count) {
  return _.shuffle([
    new Role(roleIds.SERVANT_1),
    new Role(roleIds.SERVANT_2),
    new Role(roleIds.SERVANT_3),
    new Role(roleIds.SERVANT_4),
    new Role(roleIds.SERVANT_5),
  ]).slice(0, count);
};

PlayersManager.prototype._generateMinions = function (count) {
  return _.shuffle([
    new Role(roleIds.MINION_1),
    new Role(roleIds.MINION_2),
    new Role(roleIds.MINION_3),
  ]).slice(0, count);
};

PlayersManager.prototype.nextLeader = function () {
  this.getLeader()
    ? this._chooseNextPlayerAsLeader()
    : this._chooseLeaderRandomly();
};

PlayersManager.prototype.getLeader = function () {
  return this._players[this._leaderIndex];
};

PlayersManager.prototype._chooseLeaderRandomly = function () {
  this._leaderIndex = _.random(0, this._players.length - 1);

  this.getLeader().setIsLeader(true);
};

PlayersManager.prototype._chooseNextPlayerAsLeader = function () {
  this.getLeader().setIsLeader(false);

  this._leaderIndex = (this._leaderIndex + 1) % this._players.length;

  this.getLeader().setIsLeader(true);
};

PlayersManager.prototype.questVotingAllowedFor = function (username) {
  const player = this._findPlayer(username);

  return player && player.getIsProposed() && !player.getVote();
};

PlayersManager.prototype.teamVotingAllowedFor = function (username) {
  const player = this._findPlayer(username);

  return player && !player.getVote();
};

PlayersManager.prototype.teamPropositionAllowedFor = function (username) {
  return this.playerPropositionAllowedFor(username);
};

PlayersManager.prototype.playerPropositionAllowedFor = function (username) {
  const leader = this.getLeader();

  if (!leader) return false;

  return leader.getUsername() === username;
};

PlayersManager.prototype.setVote = function (vote) {
  const player = this._findPlayer(vote.getUsername());

  if (!player) return;

  player.setVote(vote);
};

PlayersManager.prototype.resetVotes = function () {
  this._players.forEach((player) => player.setVote(null));
};

PlayersManager.prototype.resetPropositions = function () {
  this._players.forEach((player) => player.setIsProposed(false));
};

module.exports = PlayersManager;
