import { Vote } from './vote';
import { QuestSerialized } from './types/quest-serialized';
import { QuestStatus } from './enums/quest-status';
import { VoteSerialized } from './types/vote-serialized';

// TODO: convert to using states
export class Quest {
  private votesNeededCount: number;
  private failsNeededCount: number;
  private totalPlayers: number;
  private teamVoteRounds: Vote[][] = [[], [], [], [], []];
  private teamVotingRoundIndex: number = 0;
  private questVotes: Vote[] = [];

  constructor(config: {
    votesNeededCount: number;
    failsNeededCount: number;
    totalPlayers: number;
  }) {
    this.votesNeededCount = config.votesNeededCount;
    this.failsNeededCount = config.failsNeededCount;
    this.totalPlayers = config.totalPlayers;
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
      (acc, vote) => (vote.getValue() ? acc : acc + 1),
      0,
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
    return (
      this.teamVotingSucceeded() &&
      this.questVotes.length < this.votesNeededCount
    );
  }

  teamVotingSucceeded() {
    return !this.teamVotingAllowed() && this.majorityApproved();
  }

  private majorityApproved() {
    const currentRound = this.getCurrentTeamVotingRound();

    const rejectsCount = currentRound.reduce(
      (acc, vote) => (vote.getValue() ? acc : acc + 1),
      0,
    );

    return rejectsCount < Math.ceil(currentRound.length / 2);
  }

  teamVotingAllowed() {
    return (
      this.getCurrentTeamVotingRound().length < this.totalPlayers ||
      !this.majorityApproved()
    );
  }

  teamVotingRoundFinished() {
    if (this.teamVotingSucceeded()) return true;

    const previousRound = this.getPreviousTeamVotingRound();

    if (!previousRound) return false;

    return (
      this.everybodyVotedFor(previousRound) &&
      this.getCurrentTeamVotingRound().length === 0
    );
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

  serialize(votesOmitted: boolean, resultsConcealed: boolean): QuestSerialized {
    return {
      status: this.getStatus(),
      failsNeededCount: this.failsNeededCount,
      votesNeededCount: this.votesNeededCount,
      teamVotes: this.getSerializedTeamVotes(votesOmitted, resultsConcealed),
      questVotes: this.getSerializedQuestVotes(votesOmitted, resultsConcealed),
    };
  }

  private getSerializedTeamVotes(
    votesOmitted: boolean,
    resultsConcealed: boolean,
  ): VoteSerialized[] {
    if (votesOmitted || this.questVotingAllowed() || this.isComplete()) {
      return [];
    }

    const votes = this.getCurrentTeamVotingRound();

    return resultsConcealed
      ? votes.map((v) => new Vote(v.getId(), null).serialize())
      : votes.map((v) => v.serialize());
  }

  private getSerializedQuestVotes(
    votesOmitted: boolean,
    resultsConcealed: boolean,
  ): VoteSerialized[] {
    if (votesOmitted) return [];

    if (resultsConcealed) {
      return this.questVotes.map((v) => new Vote(v.getId(), null).serialize());
    }

    const votes = this.questVotes.map((v) => new Vote(null, v.getValue()));

    votes.sort((a: Vote) => (a.getValue() ? -1 : 1));

    return votes.map((vote) => vote.serialize());
  }
}
