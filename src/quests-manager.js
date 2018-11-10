const errors = require('./errors');
const Quest  = require('./quest');

const QuestsManager = function () {
  this._levelPreset         = null;
  this._quests              = [];
  this._currentQuestIndex   = 0;
  this._assassinationStatus = -1;
};

QuestsManager.prototype.setAssassinationStatus = function (isSuccessful) {
  if (this._getFailedQuestsCount() < 3
      && this._getSucceededQuestsCount() < 3
  ) {
    throw new Error(errors.NO_ASSASSINATION_TIME);
  }

  this._assassinationStatus = isSuccessful ? 1 : 0;
};

QuestsManager.prototype.getLevelPreset = function () {
  return this._levelPreset;
};

QuestsManager.prototype.getAll = function () {
  return this._quests;
};

QuestsManager.prototype.init = function (levelPreset) {
  this._levelPreset = levelPreset;

  this._quests = this._levelPreset.getQuestsConfig().map(
    (config) => new Quest({
      votesNeeded: config.votesNeeded,
      failsNeeded: config.failsNeeded,
      totalPlayers: this._levelPreset.getPlayerCount()
    })
  );
};

QuestsManager.prototype.addVote = function (vote) {
  return this.getCurrentQuest().addVote(vote);
};

QuestsManager.prototype.teamVotingRoundFinished = function () {
  return this.getCurrentQuest().teamVotingRoundFinished();
};

QuestsManager.prototype.teamVotingSucceeded = function () {
  return this.getCurrentQuest().teamVotingSucceeded();
};

QuestsManager.prototype.getCurrentQuest = function () {
  return this._quests[this._currentQuestIndex];
};

QuestsManager.prototype.nextQuest = function () {
  this._currentQuestIndex++;
};

QuestsManager.prototype.isLastRoundOfTeamVoting = function () {
  return this.getCurrentQuest().isLastRoundOfTeamVoting();
};

QuestsManager.prototype.getStatus = function () {
  if (this._assassinationStatus !== -1) {
    return this._assassinationStatus === 1 ? 0 : 1;
  }

  if (this._getFailedQuestsCount() >= 3) return 0;

  return -1;
};

QuestsManager.prototype.assassinationIsAllowed = function () {
  return this._getSucceededQuestsCount() >= 3
         && this._assassinationStatus === -1;
};

QuestsManager.prototype._getFailedQuestsCount = function () {
  return this.getAll().filter(q => q.getStatus() === 0).length;
};

QuestsManager.prototype._getSucceededQuestsCount = function () {
  return this.getAll().filter(q => q.getStatus() === 1).length;
};

module.exports = QuestsManager;
