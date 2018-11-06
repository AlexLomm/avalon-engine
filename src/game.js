const crypto         = require('crypto');
const errors         = require('./errors');
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

  if (playerCount < 5 || playerCount > 10) {
    throw new Error(errors.INCORRECT_NUMBER_OF_PLAYERS);
  }

  this._startedAt   = new Date();
  this._levelPreset = new LevelPreset(playerCount);

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
  if (!this._playersManager.isAllowedToProposeTeam(username)) {
    throw new Error(errors.NO_RIGHT_TO_SUBMIT_TEAM);
  }

  const proposedPlayersCount = this._playersManager.getProposedPlayers().length;
  const votesNeededCount     = this._questsManager.getCurrentQuest().getVotesNeeded();

  if (proposedPlayersCount !== votesNeededCount) {
    throw new Error(errors.INCORRECT_NUMBER_OF_PLAYERS);
  }

  this._playersManager.markAsSubmitted();

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

  if (!this._playersManager.isAllowedToVoteForQuest(username)) {
    throw new Error(errors.NO_RIGHT_TO_VOTE);
  }

  const vote = new Vote(username, voteValue);

  this._playersManager.setVote(vote);
  this._questsManager.addVote(vote);

  if (!this.questVotingIsOn()) {
    this._playersManager.resetVotes();
    this._questsManager.nextQuest();
  }
};

Game.prototype.voteForTeam = function (username, voteValue) {
  if (!this.teamVotingIsOn()) {
    throw new Error(errors.NO_VOTING_TIME);
  }

  if (!this._playersManager.isAllowedToVoteForTeam(username)) {
    throw new Error(errors.NO_RIGHT_TO_VOTE);
  }

  const vote = new Vote(username, voteValue);

  this._playersManager.setVote(vote);
  this._questsManager.addVote(vote);

  // TODO: add state freezing logic

  if (this._questsManager.teamVotingWasSuccessful()) {
    this._playersManager.resetVotes();
  } else if (this._questsManager.teamVotingRoundIsOver()) {
    this._playersManager.resetVotes();
    this._playersManager.resetPropositions();
    this._playersManager.unmarkAsSubmitted();
  }
};

Game.prototype.toggleIsProposed = function (leaderUsername, username) {
  if (!this.teamPropositionIsOn()) {
    throw new Error(errors.NO_PROPOSITION_TIME);
  }

  if (!this._playersManager.isAllowedToProposePlayer(leaderUsername)) {
    throw new Error(errors.NO_RIGHT_TO_PROPOSE);
  }

  this._playersManager.toggleIsProposed(username);
};

Game.prototype.questVotingIsOn = function () {
  return this._gameHasStarted()
         && this._playersManager.getIsSubmitted()
         && this._questsManager.getCurrentQuest().questVotingIsAllowed();
};

Game.prototype.teamVotingIsOn = function () {
  return this._gameHasStarted()
         && this._playersManager.getIsSubmitted()
         && this._questsManager.getCurrentQuest().teamVotingIsAllowed();
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
