import { Vote } from './vote';

export enum QuestStatus {
  Unresolved = 'Unresolved',
  Lost       = 'Lost',
  Won        = 'Won',
}

export class Quest {
  private votesNeeded: number;
  private failsNeeded: number;
  private totalPlayers: number;
  private teamVoteRounds: Vote[][]     = [[], [], [], [], []];
  private teamVotingRoundIndex: number = 0;
  private questVotes: Vote[]           = [];

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
    return this.getStatus() !== QuestStatus.Unresolved;
  }

  getStatus(): QuestStatus {
    if (this.teamVotingAllowed() || this.questVotingAllowed()) {
      return QuestStatus.Unresolved;
    }

    return this.questVotingFailed() ? QuestStatus.Won : QuestStatus.Lost;
  }

  private questVotingFailed() {
    return this.failsCount() < this.failsNeeded;
  }

  private failsCount() {
    return this.questVotes.reduce(
      (acc, vote) => vote.getValue() ? acc : acc + 1, 0,
    );
  }

  addVote(vote: Vote) {
    this.teamVotingAllowed()
      ? this.addVoteForTeam(vote)
      : this.addVoteForQuest(vote);
  }

  private addVoteForTeam(vote: Vote) {
    const currentRound = this.getCurrentTeamVotingRound();

    currentRound.push(vote);

    if (this.everybodyVotedFor(currentRound) && !this.teamVotingSucceeded()) {
      this.teamVotingRoundIndex++;
    }
  }

  private addVoteForQuest(vote: Vote) {
    this.questVotes.push(vote);
  }

  questVotingAllowed() {
    return this.teamVotingSucceeded()
      && this.questVotes.length < this.votesNeeded;
  }

  teamVotingSucceeded() {
    return !this.teamVotingAllowed() && this.majorityApproved();
  }

  private majorityApproved() {
    const currentRound = this.getCurrentTeamVotingRound();

    const failsCount = currentRound.reduce(
      (acc, vote) => vote.getValue() ? acc : acc + 1, 0,
    );

    return failsCount < Math.ceil(currentRound.length / 2);
  }

  teamVotingAllowed() {
    return this.getCurrentTeamVotingRound().length < this.totalPlayers
      || !this.majorityApproved();
  }

  teamVotingRoundFinished() {
    if (this.teamVotingSucceeded()) return true;

    const previousRound = this.getPreviousTeamVotingRound();

    if (!previousRound) return false;

    return this.everybodyVotedFor(previousRound)
      && this.getCurrentTeamVotingRound().length === 0;
  }

  private getPreviousTeamVotingRound() {
    return this.teamVoteRounds[this.teamVotingRoundIndex - 1];
  }

  private everybodyVotedFor(round: Vote[]) {
    return round.length === this.totalPlayers;
  }

  private getCurrentTeamVotingRound() {
    return this.teamVoteRounds[this.teamVotingRoundIndex];
  }

  isLastRoundOfTeamVoting() {
    return this.teamVotingRoundIndex === this.teamVoteRounds.length - 1;
  }

  serialize(resultsConcealed: boolean) {
    return {
      failsNeeded: this.failsNeeded,
      votesNeeded: this.votesNeeded,
      teamVotes: this.getSerializedTeamVotes(resultsConcealed),
      questVotes: this.getSerializedQuestVotes(resultsConcealed),
    };
  }

  private getSerializedTeamVotes(resultsConcealed: boolean) {
    const votes = this.getCurrentTeamVotingRound();

    return resultsConcealed
      ? votes.map(v => new Vote(v.getUsername(), null).serialize())
      : votes.map(v => v.serialize());
  }

  private getSerializedQuestVotes(resultsConcealed: boolean) {
    if (resultsConcealed) {
      return this.questVotes.map(v => new Vote(v.getUsername(), null).serialize());
    }

    const votes = this.questVotes.map(v => new Vote(null, v.getValue()));

    return votes.sort((a: Vote, b: Vote) => a.getValue() ? -1 : 1);
  }
}
