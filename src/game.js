const crypto         = require('crypto');
const errors         = require('./errors');
const {roleIds}      = require('./roles.config');
const LevelPreset    = require('./level-preset');
const PlayersManager = require('./players-manager');
const QuestsManager  = require('./quests-manager');
const Vote           = require('./vote');

const Game = function (
  playersManager = new PlayersManager(),
  questsManager  = new QuestsManager()
) {
  this._id                  = crypto.randomBytes(20).toString('hex');
  this._createdAt           = new Date();
  this._startedAt           = null;
  this._finishedAt          = null;
  this._levelPreset         = null;
  this._rolesLastRevealedAt = null;
  this._rolesAreRevealed    = false;
  this._revealRolesPromise  = null;
  this._playersManager      = playersManager;
  this._questsManager       = questsManager;
};

Game.prototype.getId = function () {
  return this._id;
};

Game.prototype.addPlayer = function (player) {
  if (this._startedAt) {
    throw new Error(errors.GAME_ALREADY_STARTED);
  }

  this._playersManager.add(player);
};

Game.prototype.getCreatedAt = function () {
  return this._createdAt;
};

Game.prototype.getStartedAt = function () {
  return this._startedAt;
};

Game.prototype.getFinishedAt = function () {
  return this._finishedAt;
};

Game.prototype.start = function (config = {}) {
  const playerCount = this._playersManager.getAll().length;

  this._levelPreset = new LevelPreset(playerCount);
  this._startedAt   = new Date();

  this._playersManager.assignRoles(this._levelPreset, config);
  this._questsManager.init(this._levelPreset);
};

Game.prototype.finish = function () {
  this._finishedAt = new Date();
};

Game.prototype.getLevelPreset = function () {
  return this._levelPreset;
};

Game.prototype.getRolesAreRevealed = function () {
  return this._rolesAreRevealed;
};

Game.prototype.revealRoles = function (seconds) {
  if (this._revealRolesPromise) return this._revealRolesPromise;

  this._rolesAreRevealed = true;

  this._revealRolesPromise = new Promise((resolve) => {
    const rolesAreRevealed = setTimeout(() => {
      this._rolesAreRevealed    = false;
      this._revealRolesPromise  = null;
      this._rolesLastRevealedAt = new Date();
      clearTimeout(rolesAreRevealed);

      resolve();
    }, seconds * 1000);
  });

  return this._revealRolesPromise;
};

Game.prototype.submitTeam = function (username) {
  if (!this._playersManager.teamProposalAllowedFor(username)) {
    throw new Error(errors.NO_RIGHT_TO_SUBMIT_TEAM);
  }

  const proposedPlayersCount = this._playersManager.getProposedPlayers().length;
  const votesNeededCount     = this._questsManager.getCurrentQuest().getVotesNeeded();

  if (proposedPlayersCount !== votesNeededCount) {
    throw new Error(errors.INCORRECT_NUMBER_OF_PLAYERS);
  }

  this._playersManager.setIsSubmitted(true);

  if (this._questsManager.isLastRoundOfTeamVoting()) {
    this._playersManager
      .getAll()
      .forEach((player) => this.voteForTeam(player.getUsername(), true));
  }
};

Game.prototype.voteForQuest = function (username, voteValue) {
  if (!this.questVotingIsOn()) {
    throw new Error(errors.NO_VOTING_TIME);
  }

  if (!this._playersManager.questVotingAllowedFor(username)) {
    throw new Error(errors.NO_RIGHT_TO_VOTE);
  }

  this._vote(username, voteValue);

  if (!this.questVotingIsOn()) {
    this._resetFlags();

    this._questsManager.nextQuest();
  }
};

Game.prototype.voteForTeam = function (username, voteValue) {
  if (!this.teamVotingIsOn()) {
    throw new Error(errors.NO_VOTING_TIME);
  }

  if (!this._playersManager.teamVotingAllowedFor(username)) {
    throw new Error(errors.NO_RIGHT_TO_VOTE);
  }

  this._vote(username, voteValue);

  // TODO: add state freezing logic

  if (this._questsManager.teamVotingSucceeded()) {
    this._playersManager.resetVotes();

    return;
  }

  if (this._questsManager.teamVotingRoundFinished()) {
    this._resetFlags();
  }
};

Game.prototype._resetFlags = function () {
  this._playersManager.resetVotes();
  this._playersManager.resetPropositions();
  this._playersManager.setIsSubmitted(false);
};

Game.prototype._vote = function (username, voteValue) {
  const vote = new Vote(username, voteValue);
  this._playersManager.setVote(vote);
  this._questsManager.addVote(vote);
};

Game.prototype.toggleProposition = function (leaderUsername, username) {
  if (!this.teamPropositionIsOn()) {
    throw new Error(errors.NO_PROPOSITION_TIME);
  }

  if (!this._playersManager.playerProposalAllowedFor(leaderUsername)) {
    throw new Error(errors.NO_RIGHT_TO_PROPOSE);
  }

  this._playersManager.toggleProposition(username);
};

Game.prototype.assassinate = function (assassinsUsername, victimsUsername) {
  if (!this.assassinationIsOn()) {
    throw new Error(errors.NO_ASSASSINATION_TIME);
  }

  this._playersManager.assassinate(assassinsUsername, victimsUsername);
  this._questsManager.setAssassinationStatus(this._assassinationIsSuccessful());
};

Game.prototype.assassinationIsOn = function () {
  return this._questsManager.assassinationIsAllowed();
};

Game.prototype._assassinationIsSuccessful = function () {
  return this._playersManager.getVictim().getRole().getId() === roleIds.MERLIN;
};

Game.prototype.questVotingIsOn = function () {
  return this._gameHasStarted()
         && this._playersManager.getIsSubmitted()
         && this._questsManager.getCurrentQuest().questVotingAllowed();
};

Game.prototype.teamVotingIsOn = function () {
  return this._gameHasStarted()
         && this._playersManager.getIsSubmitted()
         && this._questsManager.getCurrentQuest().teamVotingAllowed();
};

Game.prototype.teamPropositionIsOn = function () {
  return this._gameHasStarted()
         && !this._playersManager.getIsSubmitted();
};

Game.prototype._gameHasStarted = function () {
  return this._startedAt
         && this._rolesLastRevealedAt
         && !this._rolesAreRevealed;
};

module.exports = Game;
