const errors = require('./errors');

const Quest = function (config = {}) {
  if (!config.votesNeeded || !config.failsNeeded || !config.totalPlayers) {
    throw new Error(errors.INCORRECT_ARGUMENTS);
  }

  this._votesNeeded                 = config.votesNeeded;
  this._failsNeeded                 = config.failsNeeded;
  this._totalPlayers                = config.totalPlayers;
  this._teamVoteRounds              = [[], [], [], [], []];
  this._currentTeamVotingRoundIndex = 0;
  this._questVotes                  = [];
  this._tracker                     = 1;
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

Quest.prototype.questVotingFinished = function () {
  return this._questVotes.length === this._votesNeeded;
};

Quest.prototype.isComplete = function () {
  return this.getStatus() !== -1;
};

Quest.prototype.getStatus = function () {
  if (this.teamVotingAllowed() || this.questVotingAllowed()) {
    return -1;
  }

  return this._questVotingFailed() ? 1 : 0;
};

Quest.prototype._questVotingFailed = function () {
  return this._failsCount() < this._failsNeeded;
};

Quest.prototype._failsCount = function () {
  return this._questVotes.reduce(
    (acc, vote) => vote.getValue() ? acc : acc + 1, 0
  );
};

Quest.prototype.addVote = function (vote) {
  this.teamVotingAllowed()
    ? this._addVoteForTeam(vote)
    : this._addVoteForQuest(vote);
};

Quest.prototype._addVoteForTeam = function (vote) {
  const currentRound = this._getCurrentTeamVotingRound();

  if (this._alreadyVotedFor(currentRound, vote)) {
    throw new Error(errors.VOTED_ALREADY);
  }

  currentRound.push(vote);

  if (this._everybodyVotedFor(currentRound) && !this.teamVotingSucceeded()) {
    this._nextTeamVotingRound();
  }
};

Quest.prototype._nextTeamVotingRound = function () {
  this._currentTeamVotingRoundIndex++;
  this._tracker++;
};

Quest.prototype._addVoteForQuest = function (vote) {
  if (this._alreadyVotedFor(this._questVotes, vote)) {
    throw new Error(errors.VOTED_ALREADY);
  }

  this._questVotes.push(vote);
};

Quest.prototype._alreadyVotedFor = function (votes, vote) {
  return !!votes.find((v) => v.getUsername() === vote.getUsername());
};

Quest.prototype.questVotingAllowed = function () {
  return this.teamVotingSucceeded()
         && this._questVotes.length < this._votesNeeded;
};

Quest.prototype.teamVotingSucceeded = function () {
  return !this.teamVotingAllowed() && this._majorityApproved();
};

Quest.prototype._majorityApproved = function () {
  const currentRound = this._getCurrentTeamVotingRound();

  const failsCount = currentRound.reduce(
    (acc, vote) => vote.getValue() ? acc : acc + 1, 0
  );

  return failsCount < Math.ceil(currentRound.length / 2);
};

Quest.prototype.teamVotingAllowed = function () {
  return this._getCurrentTeamVotingRound().length < this._totalPlayers
         || !this._majorityApproved();
};

Quest.prototype.teamVotingRoundFinished = function () {
  if (this.teamVotingSucceeded()) return true;

  const previousRound = this._getPreviousTeamVotingRound();

  if (!previousRound) return false;

  return this._everybodyVotedFor(previousRound)
         && this._getCurrentTeamVotingRound().length === 0;
};

Quest.prototype._getPreviousTeamVotingRound = function () {
  return this._teamVoteRounds[this._currentTeamVotingRoundIndex - 1];
};

Quest.prototype._everybodyVotedFor = function (round) {
  return round.length === this._totalPlayers;
};

Quest.prototype._getCurrentTeamVotingRound = function () {
  return this._teamVoteRounds[this._currentTeamVotingRoundIndex];
};

Quest.prototype.isLastRoundOfTeamVoting = function () {
  return this._currentTeamVotingRoundIndex === this._teamVoteRounds.length - 1;
};

module.exports = Quest;
