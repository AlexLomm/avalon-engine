import * as crypto from 'crypto';
import { LevelPreset } from './level-preset';
import { PlayersManager } from './players-manager';
import { QuestsManager } from './quests-manager';
import { Player } from './player';
import * as fromErrors from './errors';
import { RoleId } from './configs/roles.config';

export class Game {
  private _id: string                = crypto.randomBytes(20).toString('hex');
  private _createdAt: Date           = new Date();
  private _startedAt: Date;
  private _finishedAt: Date;
  private _rolesLastRevealedAt: Date;
  private _rolesAreRevealed: boolean = false;
  private _revealRolesPromise: Promise<void>;
  private _levelPreset: LevelPreset  = LevelPreset.null();
  private _playersManager: PlayersManager;
  private _questsManager: QuestsManager;

  constructor(
    playersManager = new PlayersManager(),
    questsManager  = new QuestsManager(),
  ) {
    this._id             = crypto.randomBytes(20).toString('hex');
    this._playersManager = playersManager;
    this._questsManager  = questsManager;
  }

  getId() {
    return this._id;
  }

  addPlayer(player: Player) {
    if (this._startedAt) {
      throw new fromErrors.AlreadyStartedGameError();
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

  start(roleIds: RoleId[] = []) {
    const playerCount = this._playersManager.getAll().length;

    this._levelPreset = new LevelPreset(playerCount);
    this._startedAt   = new Date();

    this._playersManager.assignRoles(this._levelPreset, roleIds);
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

  revealRoles(seconds: number) {
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

  submitTeam(username: string) {
    if (!this._playersManager.playerPropositionAllowedFor(username)) {
      throw new fromErrors.DeniedTeamSubmissionError();
    }

    const proposedPlayersCount = this._playersManager.getProposedPlayers().length;
    const votesNeededCount     = this._questsManager.getCurrentQuest().getVotesNeeded();

    if (proposedPlayersCount !== votesNeededCount) {
      throw new fromErrors.RequiredCorrectTeammatesAmountError();
    }

    this._playersManager.setIsSubmitted(true);

    if (this._questsManager.isLastRoundOfTeamVoting()) {
      this._playersManager
        .getAll()
        .forEach((player: Player) => this.voteForTeam(player.getUsername(), true));
    }
  }

  voteForQuest(username: string, voteValue: boolean) {
    if (!this.questVotingIsOn()) {
      throw new fromErrors.NoTimeForQuestVotingError();
    }

    if (!this._playersManager.questVotingAllowedFor(username)) {
      throw new fromErrors.DeniedQuestVotingError();
    }

    this._vote(username, voteValue);

    if (!this.questVotingIsOn()) {
      this._resetFlags();

      this._questsManager.nextQuest();
    }
  }

  voteForTeam(username: string, voteValue: boolean) {
    if (!this.teamVotingIsOn()) {
      throw new fromErrors.NoTimeForTeamVotingError();
    }

    if (!this._playersManager.teamVotingAllowedFor(username)) {
      throw new fromErrors.DeniedTeamVotingError();
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

  _vote(username: string, voteValue: boolean) {
    const vote = this._playersManager.vote(username, voteValue);

    this._questsManager.addVote(vote);
  }

  toggleTeammateProposition(leaderUsername: string, username: string) {
    if (!this.teamPropositionIsOn()) {
      throw new fromErrors.NoTimeForTeammatePropositionError();
    }

    if (!this._playersManager.playerPropositionAllowedFor(leaderUsername)) {
      throw new fromErrors.DeniedTeammatePropositionError();
    }

    this._playersManager.togglePlayerProposition(username);
  }

  toggleVictimProposition(assassinsUsername: string, victimsUsername: string) {
    if (!this.assassinationIsOn()) {
      throw new fromErrors.NoTimeVictimPropositionError();
    }

    this._playersManager.toggleVictimProposition(
      assassinsUsername,
      victimsUsername,
    );
  }

  assassinate(assassinsUsername: string) {
    if (!this.assassinationIsOn()) {
      throw new fromErrors.NoTimeForAssassinationError();
    }

    this._playersManager.assassinate(assassinsUsername);
    this._questsManager.setAssassinationStatus(this._assassinationSucceeded());
  }

  assassinationIsOn() {
    return this._questsManager.assassinationAllowed();
  }

  _assassinationSucceeded() {
    return this._playersManager.getVictim().getRole().getId() === RoleId.Merlin;
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

  // serialize(forUsername) {
  //   return {
  //     meta: {
  //       startedAt: this._startedAt,
  //       finishedAt: this._finishedAt,
  //       ...this._levelPreset.serialize(),
  //     },
  //     ...this._questsManager.serialize(),
  //     // TODO: implement
  //     ...this._playersManager.serializeFor(forUsername, true),
  //   };
  // }
}
