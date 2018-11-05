const errors = require('./errors');

// TODO: accept arguments as a single object
const Quest = function (config = {}) {
  if (!config.votesNeeded || !config.failsNeeded || !config.playerCount) {
    throw new Error(errors.INCORRECT_ARGUMENTS);
  }

  this._votesNeeded       = config.votesNeeded;
  this._failsNeeded       = config.failsNeeded;
  // TODO: rename
  this._playerCount       = config.playerCount;
  this._teamVoteRounds    = [[], [], [], [], []];
  this._currentRoundIndex = 0;
  this._questVotes        = [];
  this._tracker           = 1;
};

Quest.prototype.getVotesNeeded = function () {
  return this._votesNeeded;
};

Quest.prototype.getFailsNeeded = function () {
  return this._failsNeeded;
};

Quest.prototype.getTracker = function () {
  return this._tracker;
};

Quest.prototype.getStatus = function () {
  if (this.teamVotingIsAllowed() || this.questVotingIsAllowed()) {
    return -1;
  }

  const failsCount = this._questVotes.reduce(
    (acc, vote) => vote.getValue() ? acc : acc + 1, 0
  );

  return failsCount < this._failsNeeded ? 1 : 0;
};

Quest.prototype.addVote = function (vote) {
  this.teamVotingIsAllowed()
    ? this._addVoteForTeam(vote)
    : this._addVoteForQuest(vote);
};

Quest.prototype._addVoteForTeam = function (vote) {
  if (this._hasAlreadyVotedForTeam(vote)) {
    throw new Error(errors.VOTED_ALREADY);
  }

  const currentRound = this._getCurrentTeamVotingRound();

  currentRound.push(vote);

  if (this._everybodyVotedInRound(currentRound) && !this.teamVotingWasSuccessful()) {
    this._currentRoundIndex++;
    this._tracker++;
  }
};

Quest.prototype.questVotingIsOver = function () {
  return this._questVotes.length === this._votesNeeded;
};

Quest.prototype._addVoteForQuest = function (vote) {
  if (this._hasAlreadyVotedForQuest(vote)) {
    throw new Error(errors.VOTED_ALREADY);
  }

  this._questVotes.push(vote);
};

Quest.prototype._hasAlreadyVotedForTeam = function (vote) {
  return -1 < this._getCurrentTeamVotingRound()
    .findIndex(v => v.getUsername() === vote.getUsername());
};

Quest.prototype._hasAlreadyVotedForQuest = function (vote) {
  return -1 < this._questVotes
    .findIndex(v => v.getUsername() === vote.getUsername());
};

Quest.prototype.isComplete = function () {
  return !(this.teamVotingIsAllowed() || this.questVotingIsAllowed());
};

Quest.prototype.questVotingIsAllowed = function () {
  return this.teamVotingWasSuccessful()
         && this._questVotes.length < this._votesNeeded;
};

Quest.prototype.teamVotingWasSuccessful = function () {
  return !this.teamVotingIsAllowed() && this._majorityHasApproved();
};

Quest.prototype._majorityHasApproved = function () {
  const currentRound = this._getCurrentTeamVotingRound();

  const failsCount = currentRound.reduce(
    (acc, vote) => vote.getValue() ? acc : acc + 1, 0
  );

  return failsCount < Math.ceil(currentRound.length / 2);
};

Quest.prototype.teamVotingIsAllowed = function () {
  return this._getCurrentTeamVotingRound().length < this._playerCount
         || !this._majorityHasApproved();
};

Quest.prototype.teamVotingRoundIsOver = function () {
  if (this.teamVotingWasSuccessful()) return true;

  const previousRound = this._teamVoteRounds[this._currentRoundIndex - 1];

  if (!previousRound) return false;

  return this._everybodyVotedInRound(previousRound)
         && this._getCurrentTeamVotingRound().length === 0;
};

Quest.prototype._everybodyVotedInRound = function (round) {
  return round.length === this._playerCount;
};

Quest.prototype._getCurrentTeamVotingRound = function () {
  return this._teamVoteRounds[this._currentRoundIndex];
};

module.exports = Quest;
