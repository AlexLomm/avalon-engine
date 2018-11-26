import { LevelPreset } from './level-preset';
import { Quest, QuestStatus } from './quest';
import { Vote } from './vote';

export class QuestsManager {
  private levelPreset: LevelPreset  = null;
  private quests: Quest[]           = [];
  private currentQuestIndex: number = 0;

  constructor() {
  }

  getLevelPreset() {
    return this.levelPreset;
  };

  getAll() {
    return this.quests;
  };

  init(levelPreset: LevelPreset) {
    this.levelPreset = levelPreset;

    this.quests = this.levelPreset.getQuestsConfig().map(
      // TODO: add types
      (config) => new Quest({
        votesNeeded: config.votesNeeded,
        failsNeeded: config.failsNeeded,
        totalPlayers: this.levelPreset.getPlayerCount(),
      }),
    );
  };

  addVote(vote: Vote) {
    this.getCurrentQuest().addVote(vote);
  };

  getFailedQuestsCount() {
    return this.quests
      .filter((q) => q.getStatus() === QuestStatus.Lost)
      .length;
  };

  getSucceededQuestsCount() {
    return this.quests
      .filter((q) => q.getStatus() === QuestStatus.Won)
      .length;
  };

  teamVotingRoundFinished() {
    return this.getCurrentQuest().teamVotingRoundFinished();
  };

  teamVotingSucceeded() {
    return this.getCurrentQuest().teamVotingSucceeded();
  };

  getVotesNeeded() {
    return this.getCurrentQuest().getVotesNeeded();
  }

  // TODO: make private
  getCurrentQuest() {
    return this.quests[this.currentQuestIndex];
  };

  nextQuest() {
    this.currentQuestIndex++;
  };

  isLastRoundOfTeamVoting() {
    return this.getCurrentQuest().isLastRoundOfTeamVoting();
  };

  serialize(resultsConcealed: boolean) {
    return {
      collection: this.quests.map(q => q.serialize(resultsConcealed)),
      teamVotingRoundIndex: this.getCurrentQuest()
        ? this.getCurrentQuest().getTeamVotingRoundIndex()
        : 0,
    };
  }
}
