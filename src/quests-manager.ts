import { LevelPreset } from './level-preset';
import { Quest } from './quest';
import { Vote } from './vote';
import * as fromErrors from './errors';

export class QuestsManager {
  private _levelPreset: LevelPreset = null;
  private _quests: Quest[]          = [];
  private _currentQuestIndex        = 0;
  private _assassinationStatus      = -1;

  constructor() {
  }

  setAssassinationStatus(isSuccessful: boolean) {
    if (
      this._getFailedQuestsCount() < 3
      && this._getSucceededQuestsCount() < 3
    ) {
      throw new fromErrors.NoTimeForAssassinationError();
    }

    this._assassinationStatus = isSuccessful ? 1 : 0;
  };

  getLevelPreset() {
    return this._levelPreset;
  };

  getAll() {
    return this._quests;
  };

  init(levelPreset: LevelPreset) {
    this._levelPreset = levelPreset;

    this._quests = this._levelPreset.getQuestsConfig().map(
      // TODO: add types
      (config) => new Quest({
        votesNeeded: config.votesNeeded,
        failsNeeded: config.failsNeeded,
        totalPlayers: this._levelPreset.getPlayerCount(),
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
    return this._quests[this._currentQuestIndex];
  };

  nextQuest() {
    this._currentQuestIndex++;
  };

  isLastRoundOfTeamVoting() {
    return this.getCurrentQuest().isLastRoundOfTeamVoting();
  };

  getStatus() {
    if (this._assassinationStatus !== -1) {
      return this._assassinationStatus === 1 ? 0 : 1;
    }

    if (this._getFailedQuestsCount() >= 3) return 0;

    return -1;
  };

  assassinationAllowed() {
    return this._getSucceededQuestsCount() >= 3
      && this._assassinationStatus === -1;
  };

  _getFailedQuestsCount() {
    return this.getAll().filter(q => q.getStatus() === 0).length;
  };

  _getSucceededQuestsCount() {
    return this.getAll().filter(q => q.getStatus() === 1).length;
  };

  serialize() {
    return {
      assassinationStatus: this._assassinationStatus,
      quests: this._quests.map(q => q.serialize()),
      teamVotingRoundIndex: this.getCurrentQuest()
        ? this.getCurrentQuest().getTeamVotingRoundIndex()
        : 0,
    };
  }
}
