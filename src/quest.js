const errors = require('../configs/errors.config');

class Quest {
  constructor(config = {}) {
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
  }

  getVotesNeeded() {
    return this._votesNeeded;
  }

  getFailsNeeded() {
    return this._failsNeeded;
  }

  getTracker() {
    return this._tracker;
  }

  questVotingFinished() {
    return this._questVotes.length === this._votesNeeded;
  }

  isComplete() {
    return this.getStatus() !== -1;
  }

  getStatus() {
    if (this.teamVotingAllowed() || this.questVotingAllowed()) {
      return -1;
    }

    return this._questVotingFailed() ? 1 : 0;
  }

  _questVotingFailed() {
    return this._failsCount() < this._failsNeeded;
  }

  _failsCount() {
    return this._questVotes.reduce(
      (acc, vote) => vote.getValue() ? acc : acc + 1, 0
    );
  }

  addVote(vote) {
    this.teamVotingAllowed()
      ? this._addVoteForTeam(vote)
      : this._addVoteForQuest(vote);
  }

  _addVoteForTeam(vote) {
    const currentRound = this._getCurrentTeamVotingRound();

    if (this._alreadyVotedFor(currentRound, vote)) {
      throw new Error(errors.VOTED_ALREADY);
    }

    currentRound.push(vote);

    if (this._everybodyVotedFor(currentRound) && !this.teamVotingSucceeded()) {
      this._nextTeamVotingRound();
    }
  }

  _nextTeamVotingRound() {
    this._currentTeamVotingRoundIndex++;
    this._tracker++;
  }

  _addVoteForQuest(vote) {
    if (this._alreadyVotedFor(this._questVotes, vote)) {
      throw new Error(errors.VOTED_ALREADY);
    }

    this._questVotes.push(vote);
  }

  _alreadyVotedFor(votes, vote) {
    return !!votes.find((v) => v.getUsername() === vote.getUsername());
  }

  questVotingAllowed() {
    return this.teamVotingSucceeded()
           && this._questVotes.length < this._votesNeeded;
  }

  teamVotingSucceeded() {
    return !this.teamVotingAllowed() && this._majorityApproved();
  }

  _majorityApproved() {
    const currentRound = this._getCurrentTeamVotingRound();

    const failsCount = currentRound.reduce(
      (acc, vote) => vote.getValue() ? acc : acc + 1, 0
    );

    return failsCount < Math.ceil(currentRound.length / 2);
  }

  teamVotingAllowed() {
    return this._getCurrentTeamVotingRound().length < this._totalPlayers
           || !this._majorityApproved();
  }

  teamVotingRoundFinished() {
    if (this.teamVotingSucceeded()) return true;

    const previousRound = this._getPreviousTeamVotingRound();

    if (!previousRound) return false;

    return this._everybodyVotedFor(previousRound)
           && this._getCurrentTeamVotingRound().length === 0;
  }

  _getPreviousTeamVotingRound() {
    return this._teamVoteRounds[this._currentTeamVotingRoundIndex - 1];
  }

  _everybodyVotedFor(round) {
    return round.length === this._totalPlayers;
  }

  _getCurrentTeamVotingRound() {
    return this._teamVoteRounds[this._currentTeamVotingRoundIndex];
  }

  isLastRoundOfTeamVoting() {
    return this._currentTeamVotingRoundIndex === this._teamVoteRounds.length - 1;
  }
}

module.exports = Quest;
