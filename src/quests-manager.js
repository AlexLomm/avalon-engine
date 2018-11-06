const Quest = require('./quest');

const QuestsManager = function () {
  this._levelPreset       = null;
  this._quests            = [];
  this._currentQuestIndex = 0;
};

QuestsManager.prototype.getAll = function () {
  return this._quests;
};

QuestsManager.prototype.init = function (levelPreset) {
  this._levelPreset = levelPreset;

  this._quests = this._levelPreset.getQuests().map(
    (config) => new Quest({
      votesNeeded: config.votesNeeded,
      failsNeeded: config.failsNeeded,
      playerCount: this._levelPreset.getPlayerCount()
    })
  );
};

QuestsManager.prototype.addVote = function (vote) {
  return this.getCurrentQuest().addVote(vote);
};

QuestsManager.prototype.teamVotingRoundIsOver = function () {
  return this.getCurrentQuest().teamVotingRoundIsOver();
};

QuestsManager.prototype.teamVotingWasSuccessful = function () {
  return this.getCurrentQuest().teamVotingWasSuccessful();
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


module.exports = QuestsManager;
