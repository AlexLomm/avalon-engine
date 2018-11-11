const crypto         = require('crypto');
const errors         = require('../configs/errors.config');
const {roleIds}      = require('../configs/roles.config');
const LevelPreset    = require('./level-preset');
const PlayersManager = require('./players-manager');
const QuestsManager  = require('./quests-manager');
const Vote           = require('./vote');

class Game {
  constructor(
    playersManager = new PlayersManager(),
    questsManager  = new QuestsManager()
  ) {
    this._id                  = crypto.randomBytes(20).toString('hex');
    this._createdAt           = new Date();
    this._startedAt           = null;
    this._finishedAt          = null;
    this._levelPreset         = null;
    this._rolesLastRevealedAt = null;
    this._rolesAreRevealed    = false;
    this._revealRolesPromise  = null;
    this._playersManager      = playersManager;
    this._questsManager       = questsManager;
  }

  getId() {
    return this._id;
  }

  addPlayer(player) {
    if (this._startedAt) {
      throw new Error(errors.GAME_ALREADY_STARTED);
    }

    this._playersManager.add(player);
  }

  getCreatedAt() {
    return this._createdAt;
  }

  getStartedAt() {
    return this._startedAt;
  }

  getFinishedAt() {
    return this._finishedAt;
  }

  start(config = {}) {
    const playerCount = this._playersManager.getAll().length;

    this._levelPreset = new LevelPreset(playerCount);
    this._startedAt   = new Date();

    this._playersManager.assignRoles(this._levelPreset, config);
    this._questsManager.init(this._levelPreset);
  }

  finish() {
    this._finishedAt = new Date();
  }

  getLevelPreset() {
    return this._levelPreset;
  }

  getRolesAreRevealed() {
    return this._rolesAreRevealed;
  }

  revealRoles(seconds) {
    if (this._revealRolesPromise) return this._revealRolesPromise;

    this._rolesAreRevealed = true;

    this._revealRolesPromise = new Promise((resolve) => {
      const rolesAreRevealed = setTimeout(() => {
        this._rolesAreRevealed    = false;
        this._revealRolesPromise  = null;
        this._rolesLastRevealedAt = new Date();
        clearTimeout(rolesAreRevealed);

        resolve();
      }, seconds * 1000);
    });

    return this._revealRolesPromise;
  }

  submitTeam(username) {
    if (!this._playersManager.teamPropositionAllowedFor(username)) {
      throw new Error(errors.NO_RIGHT_TO_SUBMIT_TEAM);
    }

    const proposedPlayersCount = this._playersManager.getProposedPlayers().length;
    const votesNeededCount     = this._questsManager.getCurrentQuest().getVotesNeeded();

    if (proposedPlayersCount !== votesNeededCount) {
      throw new Error(errors.INCORRECT_NUMBER_OF_PLAYERS);
    }

    this._playersManager.setIsSubmitted(true);

    if (this._questsManager.isLastRoundOfTeamVoting()) {
      this._playersManager
        .getAll()
        .forEach((player) => this.voteForTeam(player.getUsername(), true));
    }
  }

  voteForQuest(username, voteValue) {
    if (!this.questVotingIsOn()) {
      throw new Error(errors.NO_VOTING_TIME);
    }

    if (!this._playersManager.questVotingAllowedFor(username)) {
      throw new Error(errors.NO_RIGHT_TO_VOTE);
    }

    this._vote(username, voteValue);

    if (!this.questVotingIsOn()) {
      this._resetFlags();

      this._questsManager.nextQuest();
    }
  }

  voteForTeam(username, voteValue) {
    if (!this.teamVotingIsOn()) {
      throw new Error(errors.NO_VOTING_TIME);
    }

    if (!this._playersManager.teamVotingAllowedFor(username)) {
      throw new Error(errors.NO_RIGHT_TO_VOTE);
    }

    this._vote(username, voteValue);

    // TODO: add state freezing logic

    if (this._questsManager.teamVotingSucceeded()) {
      this._playersManager.resetVotes();

      return;
    }

    if (this._questsManager.teamVotingRoundFinished()) {
      this._resetFlags();
    }
  }

  _resetFlags() {
    this._playersManager.resetVotes();
    this._playersManager.resetPropositions();
    this._playersManager.setIsSubmitted(false);
  }

  _vote(username, voteValue) {
    const vote = new Vote(username, voteValue);

    this._playersManager.setVote(vote);
    this._questsManager.addVote(vote);
  }

  toggleTeamProposition(leaderUsername, username) {
    if (!this.teamPropositionIsOn()) {
      throw new Error(errors.NO_PROPOSITION_TIME);
    }

    if (!this._playersManager.playerPropositionAllowedFor(leaderUsername)) {
      throw new Error(errors.NO_RIGHT_TO_PROPOSE_TEAMMATE);
    }

    this._playersManager.toggleTeamProposition(username);
  }

  toggleVictimProposition(assassinsUsername, victimsUsername) {
    if (!this.assassinationIsOn()) {
      throw new Error(errors.NO_VICTIM_PROPOSITION_TIME);
    }

    this._playersManager.toggleVictimProposition(assassinsUsername, victimsUsername);
  }

  assassinate(assassinsUsername, victimsUsername) {
    if (!this.assassinationIsOn()) {
      throw new Error(errors.NO_ASSASSINATION_TIME);
    }

    this._playersManager.assassinate(assassinsUsername, victimsUsername);
    this._questsManager.setAssassinationStatus(this._assassinationSucceeded());
  }

  assassinationIsOn() {
    return this._questsManager.assassinationAllowed();
  }

  _assassinationSucceeded() {
    return this._playersManager.getVictim().getRole().getId() === roleIds.MERLIN;
  }

  questVotingIsOn() {
    return this._gameStarted()
           && this._playersManager.getIsSubmitted()
           && this._questsManager.getCurrentQuest().questVotingAllowed();
  }

  teamVotingIsOn() {
    return this._gameStarted()
           && this._playersManager.getIsSubmitted()
           && this._questsManager.getCurrentQuest().teamVotingAllowed();
  }

  teamPropositionIsOn() {
    return this._gameStarted()
           && !this._playersManager.getIsSubmitted();
  }

  _gameStarted() {
    return this._startedAt
           && this._rolesLastRevealedAt
           && !this._rolesAreRevealed;
  }
}

module.exports = Game;
