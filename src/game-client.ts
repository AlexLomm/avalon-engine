import { EventEmitter } from 'events';
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
  addPlayer(id: string) {
    this.game.addPlayer(id);
  }

  /**
   * Removes a player from the game.
   *
   * This is only allowed before the game is started.
   *
   * @throws AlreadyStartedGameError
   */
  removePlayer(id: string) {
    this.game.removePlayer(id);
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
  submitTeam(leaderId: string) {
    this.game.submitTeam(leaderId);
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
  voteForQuest(id: string, voteValue: boolean) {
    this.game.voteForQuest(id, voteValue);
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
  voteForTeam(id: string, voteValue: boolean) {
    this.game.voteForTeam(id, voteValue);
  }

  /**
   * Allows a current team leader to propose / un-proposes a player
   * to join a team for the current quest.
   *
   * @throws NoTimeForTeammatePropositionError
   * @throws DeniedTeammatePropositionError
   */
  toggleTeammateProposition(leaderId: string, id: string) {
    this.game.toggleTeammateProposition(leaderId, id);
  }

  /**
   * Allows a current team leader to un-propose every player
   *
   * @throws NoTimeForTeammatePropositionError
   * @throws DeniedTeammatePropositionError
   */
  resetProposedTeammates(leaderId: string) {
    this.game.resetProposedTeammates(leaderId);
  }

  /**
   * Allows the Assassin to choose a possible victim during the assassination phase.
   *
   * @throws NoTimeVictimPropositionError
   * @throws DeniedVictimPropositionError
   * @throws DeniedSelfSacrificeError
   */
  toggleVictimProposition(assassinsId: string, victimsId: string) {
    this.game.toggleVictimProposition(assassinsId, victimsId);
  }

  /**
   * Allows the Assassin to assassinate the already chosen victim.
   *
   * @throws NoTimeForAssassinationError
   * @throws DeniedAssassinationError
   * @throws RequiredVictimError
   */
  assassinate(assassinsId: string) {
    this.game.assassinate(assassinsId);
  }

  /**
   * Serializes the game state.
   */
  serialize(forId: string): GameSerialized {
    return this.game.serialize(forId);
  }
}
