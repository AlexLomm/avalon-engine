import { Vote, VoteSerialized } from './vote';

export interface QuestSerialized {
  status: string;
  failsNeededCount: number;
  votesNeededCount: number;
  teamVotes: VoteSerialized[];
  questVotes: VoteSerialized[];
}

export enum QuestStatus {
  Unresolved = 'Unresolved',
  Lost       = 'Lost',
  Won        = 'Won',
}

export class Quest {
  private votesNeededCount: number;
  private failsNeededCount: number;
  private totalPlayers: number;
  private teamVoteRounds: Vote[][]     = [[], [], [], [], []];
  private teamVotingRoundIndex: number = 0;
  private questVotes: Vote[]           = [];

  constructor(config: {
    votesNeededCount: number,
    failsNeededCount: number,
    totalPlayers: number
  }) {
    this.votesNeededCount = config.votesNeededCount;
    this.failsNeededCount = config.failsNeededCount;
    this.totalPlayers     = config.totalPlayers;
  }

  getVotesNeededCount() {
    return this.votesNeededCount;
  }

  getFailsNeededCount() {
    return this.failsNeededCount;
  }

  // a.k.a "vote tracker"
  getTeamVotingRoundIndex() {
    return this.teamVotingRoundIndex;
  }

  questVotingFinished() {
    return this.questVotes.length === this.votesNeededCount;
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
    return this.failsCount() < this.failsNeededCount;
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
      && this.questVotes.length < this.votesNeededCount;
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

  serialize(resultsOmitted: boolean, resultsConcealed: boolean): QuestSerialized {
    const teamVotes  = resultsOmitted ? [] : this.getSerializedTeamVotes(resultsConcealed);
    const questVotes = resultsOmitted ? [] : this.getSerializedQuestVotes(resultsConcealed);

    return {
      status: this.getStatus(),
      failsNeededCount: this.failsNeededCount,
      votesNeededCount: this.votesNeededCount,
      teamVotes: teamVotes,
      questVotes: questVotes,
    };
  }

  private getSerializedTeamVotes(resultsConcealed: boolean): VoteSerialized[] {
    const votes = this.getCurrentTeamVotingRound();

    return resultsConcealed
      ? votes.map(v => new Vote(v.getUsername(), null).serialize())
      : votes.map(v => v.serialize());
  }

  private getSerializedQuestVotes(resultsConcealed: boolean): VoteSerialized[] {
    if (resultsConcealed) {
      return this.questVotes.map(v => new Vote(v.getUsername(), null).serialize());
    }

    const votes = this.questVotes.map(v => new Vote(null, v.getValue()));

    votes.sort((a: Vote, b: Vote) => a.getValue() ? -1 : 1);

    return votes.map(vote => vote.serialize());
  }
}
