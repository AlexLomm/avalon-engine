import { LevelPreset } from './level-preset';
import { Quest } from './quest';
import { Vote } from './vote';
import * as fromErrors from './errors';

export class QuestsManager {
  private levelPreset: LevelPreset    = null;
  private quests: Quest[]             = [];
  private currentQuestIndex: number   = 0;
  private assassinationStatus: number = -1;

  constructor() {
  }

  setAssassinationStatus(isSuccessful: boolean) {
    if (
      this._getFailedQuestsCount() < 3
      && this._getSucceededQuestsCount() < 3
    ) {
      throw new fromErrors.NoTimeForAssassinationError();
    }

    this.assassinationStatus = isSuccessful ? 1 : 0;
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

  getCurrentQuest() {
    return this.quests[this.currentQuestIndex];
  };

  nextQuest() {
    this.currentQuestIndex++;
  };

  isLastRoundOfTeamVoting() {
    return this.getCurrentQuest().isLastRoundOfTeamVoting();
  };

  getStatus() {
    if (this.assassinationStatus !== -1) {
      return this.assassinationStatus === 1 ? 0 : 1;
    }

    if (this._getFailedQuestsCount() >= 3) return 0;

    return -1;
  };

  assassinationAllowed() {
    return this._getSucceededQuestsCount() >= 3
      && this.assassinationStatus === -1;
  };

  _getFailedQuestsCount() {
    return this.getAll().filter(q => q.getStatus() === 0).length;
  };

  _getSucceededQuestsCount() {
    return this.getAll().filter(q => q.getStatus() === 1).length;
  };

  serialize() {
    return {
      assassinationStatus: this.assassinationStatus,
      quests: this.quests.map(q => q.serialize()),
      teamVotingRoundIndex: this.getCurrentQuest()
        ? this.getCurrentQuest().getTeamVotingRoundIndex()
        : 0,
    };
  }
}
