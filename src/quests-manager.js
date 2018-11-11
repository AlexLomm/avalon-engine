const errors = require('../configs/errors.config');
const Quest  = require('./quest');

class QuestsManager {
  constructor() {
    this._levelPreset         = null;
    this._quests              = [];
    this._currentQuestIndex   = 0;
    this._assassinationStatus = -1;
  }

  setAssassinationStatus(isSuccessful) {
    if (this._getFailedQuestsCount() < 3
        && this._getSucceededQuestsCount() < 3
    ) {
      throw new Error(errors.NO_ASSASSINATION_TIME);
    }

    this._assassinationStatus = isSuccessful ? 1 : 0;
  };

  getLevelPreset() {
    return this._levelPreset;
  };

  getAll() {
    return this._quests;
  };

  init(levelPreset) {
    this._levelPreset = levelPreset;

    this._quests = this._levelPreset.getQuestsConfig().map(
      (config) => new Quest({
        votesNeeded: config.votesNeeded,
        failsNeeded: config.failsNeeded,
        totalPlayers: this._levelPreset.getPlayerCount()
      })
    );
  };

  addVote(vote) {
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
}

module.exports = QuestsManager;
