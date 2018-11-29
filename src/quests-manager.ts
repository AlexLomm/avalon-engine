import { LevelPreset } from './level-preset';
import { Quest, QuestStatus, QuestSerialized } from './quest';
import { Vote } from './vote';

export interface QuestsManagerSerialized {
  collection: QuestSerialized[];
  teamVotingRoundIndex: number;
}

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
        votesNeededCount: config.votesNeededCount,
        failsNeededCount: config.failsNeededCount,
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

  getVotesNeededCount() {
    return this.getCurrentQuest().getVotesNeededCount();
  }

  questVotingAllowed() {
    return this.getCurrentQuest().questVotingAllowed();
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

  serialize(resultsConcealed: boolean): QuestsManagerSerialized {
    return {
      collection: this.getSerializedQuests(resultsConcealed),
      teamVotingRoundIndex: this.getCurrentQuest()
        ? this.getCurrentQuest().getTeamVotingRoundIndex()
        : 0,
    };
  }

  private getSerializedQuests(resultsConcealed: boolean) {
    return this.quests.map(q => {
      const isOmitted = q !== this.getCurrentQuest();

      return q.serialize(isOmitted, resultsConcealed);
    });
  }
}
