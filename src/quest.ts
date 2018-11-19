import { Vote } from './vote';
import * as fromErrors from './errors';

export class Quest {
  private votesNeeded: number;
  private failsNeeded: number;
  private totalPlayers: number;
  private teamVoteRounds: Vote[][]     = [[], [], [], [], []];
  private teamVotingRoundIndex: number = 0;
  private questVotes: Vote[]           = [];

  // TODO: refactor type
  constructor(config: {
    votesNeeded: number,
    failsNeeded: number,
    totalPlayers: number
  }) {
    this.votesNeeded  = config.votesNeeded;
    this.failsNeeded  = config.failsNeeded;
    this.totalPlayers = config.totalPlayers;
  }

  getVotesNeeded() {
    return this.votesNeeded;
  }

  getFailsNeeded() {
    return this.failsNeeded;
  }

  // a.k.a "vote tracker"
  getTeamVotingRoundIndex() {
    return this.teamVotingRoundIndex;
  }

  questVotingFinished() {
    return this.questVotes.length === this.votesNeeded;
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
    return this._failsCount() < this.failsNeeded;
  }

  _failsCount() {
    return this.questVotes.reduce(
      (acc, vote) => vote.getValue() ? acc : acc + 1, 0,
    );
  }

  addVote(vote: Vote) {
    this.teamVotingAllowed()
      ? this._addVoteForTeam(vote)
      : this._addVoteForQuest(vote);
  }

  _addVoteForTeam(vote: Vote) {
    const currentRound = this._getCurrentTeamVotingRound();

    // TODO: voting validation is also handled by the players manager
    if (this._alreadyVotedFor(currentRound, vote)) {
      throw new fromErrors.AlreadyVotedForTeamError();
    }

    currentRound.push(vote);

    if (this._everybodyVotedFor(currentRound) && !this.teamVotingSucceeded()) {
      this.teamVotingRoundIndex++;
    }
  }

  _addVoteForQuest(vote: Vote) {
    // TODO: voting validation is also handled by the players manager
    if (this._alreadyVotedFor(this.questVotes, vote)) {
      throw new fromErrors.AlreadyVotedForQuestError();
    }

    this.questVotes.push(vote);
  }

  _alreadyVotedFor(votes: Vote[], vote: Vote) {
    return !!votes.find((v: Vote) => v.getUsername() === vote.getUsername());
  }

  questVotingAllowed() {
    return this.teamVotingSucceeded()
      && this.questVotes.length < this.votesNeeded;
  }

  teamVotingSucceeded() {
    return !this.teamVotingAllowed() && this._majorityApproved();
  }

  _majorityApproved() {
    const currentRound = this._getCurrentTeamVotingRound();

    const failsCount = currentRound.reduce(
      (acc, vote) => vote.getValue() ? acc : acc + 1, 0,
    );

    return failsCount < Math.ceil(currentRound.length / 2);
  }

  teamVotingAllowed() {
    return this._getCurrentTeamVotingRound().length < this.totalPlayers
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
    return this.teamVoteRounds[this.teamVotingRoundIndex - 1];
  }

  _everybodyVotedFor(round: Vote[]) {
    return round.length === this.totalPlayers;
  }

  _getCurrentTeamVotingRound() {
    return this.teamVoteRounds[this.teamVotingRoundIndex];
  }

  isLastRoundOfTeamVoting() {
    return this.teamVotingRoundIndex === this.teamVoteRounds.length - 1;
  }

  serialize() {
    return {
      failsNeeded: this.failsNeeded,
      votesNeeded: this.votesNeeded,
      teamVotes: this._getCurrentTeamVotingRound().map(vote => vote.serialize()),
      questVotes: this.questVotes.map(vote => vote.serialize()),
    };
  }
}
