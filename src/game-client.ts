import EventEmitter from 'events';
import { GameStateMachine } from './game-states/game-state-machine';
import { Game } from './game';
import { PlayersManager } from './players-manager';
import { QuestsManager } from './quests-manager';
import { GameMetaData } from './game-meta-data';
import { PreparationState } from './game-states/preparation-state';
import { IGameClientApi } from './interfaces/game-client-api';
import { GameConfig } from './types/game-config';
import { GameSerialized } from './types/game-serialized';
import { RoleId } from './enums/role-id';
import { GameEvent } from './enums/game-event';
import { IIdentifiable } from './interfaces/identifiable';

const defaultConfig: GameConfig = {
  stateTransitionWaitTimes: {
    afterTeamProposition: 5000,
    afterTeamVoting: 7500,
    afterQuestVoting: 7500,
  },
};

export class GameClient implements IGameClientApi, IIdentifiable {
  private game: Game;

  constructor(config: GameConfig = defaultConfig) {
    this.game = new Game(
      new PlayersManager(),
      new QuestsManager(),
      new GameMetaData(),
      new GameStateMachine(config.stateTransitionWaitTimes),
      new PreparationState(),
      new EventEmitter(),
    );
  }

  /**
   * Gets the game id.
   */
  getId() {
    return this.game.getMetaData().getId();
  }

  /**
   * Registers an event listener
   */
  on(event: GameEvent, cb: () => void) {
    this.game.on(event, cb);
  }

  /**
   * Removes an event listener
   */
  off(event: GameEvent, cb: () => void) {
    this.game.off(event, cb);
  }

  /**
   * Adds a new player to the game.
   *
   * This is only allowed before the game is started.
   *
   * @throws AlreadyStartedGameError
   * @throws AlreadyExistsPlayerError
   * @throws PlayersMaximumReachedError
   */
  addPlayer(username: string) {
    this.game.addPlayer(username);
  }

  /**
   * Starts a game.
   *
   * There should be enough players.
   *
   * @throws AlreadyStartedGameError
   * @throws PlayersAmountIncorrectError
   */
  start(roleIds: RoleId[] = []) {
    this.game.start(roleIds);
  }

  /**
   * Finalizes a team proposition by the current leader. This allows
   * all the players to either decline or approve the proposed team
   * by the means of voting.
   *
   * @throws NoTimeForTeamSubmissionError
   * @throws NoTimeForTeammatePropositionError
   * @throws DeniedTeamSubmissionError
   * @throws RequiredCorrectTeammatesAmountError
   */
  submitTeam(leaderUsername: string) {
    this.game.submitTeam(leaderUsername);
  }

  /**
   * Allows a team member to vote whether the quest was successful
   * or not.
   *
   * @throws NoTimeForQuestVotingError
   * @throws DeniedQuestVotingError
   * @throws PlayerMissingError
   * @throws AlreadyVotedError
   */
  voteForQuest(username: string, voteValue: boolean) {
    this.game.voteForQuest(username, voteValue);
  }

  /**
   * Allows a player to either approve or reject the currently
   * proposed team.
   *
   * @throws NoTimeForTeamVotingError
   * @throws DeniedTeamVotingError
   * @throws PlayerMissingError
   * @throws AlreadyVotedError
   */
  voteForTeam(username: string, voteValue: boolean) {
    this.game.voteForTeam(username, voteValue);
  }

  /**
   * Allows a current team leader to propose / un-proposes a player
   * to join a team for the current quest.
   *
   * @throws NoTimeForTeammatePropositionError
   * @throws DeniedTeammatePropositionError
   */
  toggleTeammateProposition(leaderUsername: string, username: string) {
    this.game.toggleTeammateProposition(leaderUsername, username);
  }

  /**
   * Allows the Assassin to choose a possible victim during the assassination phase.
   *
   * @throws NoTimeVictimPropositionError
   * @throws DeniedVictimPropositionError
   * @throws DeniedSelfSacrificeError
   */
  toggleVictimProposition(assassinsUsername: string, victimsUsername: string) {
    this.game.toggleVictimProposition(assassinsUsername, victimsUsername);
  }

  /**
   * Allows the Assassin to assassinate the already chosen victim.
   *
   * @throws NoTimeForAssassinationError
   * @throws DeniedAssassinationError
   * @throws RequiredVictimError
   */
  assassinate(assassinsUsername: string) {
    this.game.assassinate(assassinsUsername);
  }

  /**
   * Serializes the game state.
   */
  serialize(forUsername: string): GameSerialized {
    return this.game.serialize(forUsername);
  }
}
