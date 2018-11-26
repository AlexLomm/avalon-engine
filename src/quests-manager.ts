import { LevelPreset } from './level-preset';
import { Quest, QuestStatus } from './quest';
import { Vote } from './vote';

// TODO: move to the meta information
export enum GameStatus {
  Unfinished = 'Unfinished',
  Won        = 'Won',
  Lost       = 'Lost',
}

// TODO: move to the players manager
export enum AssassinationStatus {
  Unattempted    = 'Unattempted',
  IncorrectGuess = 'IncorrectGuess',
  CorrectGuess   = 'CorrectGuess'
}

export class QuestsManager {
  private levelPreset: LevelPreset  = null;
  private quests: Quest[]           = [];
  private currentQuestIndex: number = 0;
  private assassinationStatus       = AssassinationStatus.Unattempted;

  constructor() {
  }

  setAssassinationStatus(isSuccessful: boolean) {
    this.assassinationStatus = isSuccessful
      ? AssassinationStatus.CorrectGuess
      : AssassinationStatus.IncorrectGuess;
  };

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
    return this.getCurrentQuest().addVote(vote);
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

  getCurrentQuest() {
    return this.quests[this.currentQuestIndex];
  };

  nextQuest() {
    this.currentQuestIndex++;
  };

  isLastRoundOfTeamVoting() {
    return this.getCurrentQuest().isLastRoundOfTeamVoting();
  };

  getGameStatus(): GameStatus {
    if (this.assassinationStatus !== AssassinationStatus.Unattempted) {
      return this.assassinationStatus === AssassinationStatus.CorrectGuess
        ? GameStatus.Lost
        : GameStatus.Won;
    }

    if (this.getFailedQuestsCount() >= 3) return GameStatus.Lost;

    return GameStatus.Unfinished;
  };

  assassinationAllowed() {
    return this.getSucceededQuestsCount() >= 3
      && this.assassinationStatus === AssassinationStatus.Unattempted;
  };

  private getFailedQuestsCount() {
    return this.getAll().filter((q) => {
      return q.getStatus() === QuestStatus.Lost;
    }).length;
  };

  private getSucceededQuestsCount() {
    return this.getAll().filter(q => {
      return q.getStatus() === QuestStatus.Won;
    }).length;
  };

  serialize(resultsConcealed: boolean) {
    return {
      assassinationStatus: this.assassinationStatus,
      collection: this.quests.map(q => q.serialize(resultsConcealed)),
      teamVotingRoundIndex: this.getCurrentQuest()
        ? this.getCurrentQuest().getTeamVotingRoundIndex()
        : 0,
    };
  }
}
