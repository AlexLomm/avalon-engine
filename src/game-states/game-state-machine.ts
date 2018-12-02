import EventEmitter from 'events';
import { Game } from '../game';
import { TeamPropositionState } from './team-proposition-state';
import { TeamVotingState } from './team-voting-state';
import { QuestVotingState } from './quest-voting-state';
import { FrozenState } from './frozen-state';
import { TypeState } from 'typestate';
import { AssassinationState } from './assassination-state';
import { BaseState } from './base-state';
import { FinishState } from './finish-state';
import { GameStatus } from '../enums/game-status';
import { GameState } from '../enums/game-state';
import { GameStateTransitionWaitTimes } from '../types/game-state-transition-wait-times';
import { GameEvent } from '../enums/game-event';
import { IEventListener } from '../interfaces/event-listener';

export class GameStateMachine implements IEventListener {
  private isInit: boolean;
  private fsm: TypeState.FiniteStateMachine<GameState>;
  private game: Game;
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor(
    // TODO: import defaults from a config file
    private waitTimes: GameStateTransitionWaitTimes = {
      afterTeamProposition: 5000,
      afterTeamVoting: 5000,
      afterQuestVoting: 5000,
    },
  ) {
  }

  init(game: Game, startingState: GameState = GameState.Preparation) {
    if (this.isInit) return;

    this.isInit = true;

    this.initTransitions(startingState);
    this.initTransitionListeners(game);
  }

  private initTransitions(startingState: GameState) {
    this.fsm = new TypeState.FiniteStateMachine<GameState>(startingState);

    this.fsm.from(GameState.Preparation).to(GameState.TeamProposition);
    //
    this.fsm.from(GameState.TeamProposition).to(GameState.TeamVoting);
    this.fsm.from(GameState.TeamProposition).to(GameState.TeamVotingPreApproved);
    //
    this.fsm.from(GameState.TeamVoting).to(GameState.TeamProposition);
    this.fsm.from(GameState.TeamVoting).to(GameState.QuestVoting);
    //
    this.fsm.from(GameState.TeamVotingPreApproved).to(GameState.QuestVoting);
    //
    this.fsm.from(GameState.QuestVoting).to(GameState.TeamProposition);
    this.fsm.from(GameState.QuestVoting).to(GameState.Assassination);
    this.fsm.from(GameState.QuestVoting).to(GameState.GameLost);
    //
    this.fsm.from(GameState.Assassination).to(GameState.GameLost);
    this.fsm.from(GameState.Assassination).to(GameState.GameWon);
  }

  private initTransitionListeners(game: Game) {
    this.game = game;

    this.fsm.on(GameState.TeamProposition, (from: GameState) => {
      switch (from) {
        case GameState.Preparation:
          this.setState(game, new TeamPropositionState());

          break;
        case GameState.TeamVoting:
          this.setState(game, new FrozenState());

          this.waitFor(() => {
            game.getPlayersManager().reset();

            this.setState(game, new TeamPropositionState());
          }, this.waitTimes.afterTeamVoting);

          break;
        case GameState.QuestVoting:
          this.setState(game, new FrozenState());

          this.waitFor(() => {
            game.getPlayersManager().reset();

            game.getQuestsManager().nextQuest();

            this.setState(game, new TeamPropositionState());
          }, this.waitTimes.afterQuestVoting);

          break;
      }
    });

    this.fsm.on(GameState.TeamVoting, (from: GameState) => {
      switch (from) {
        case GameState.TeamProposition:
          this.setState(game, new FrozenState());

          this.waitFor(() => {
            game.getPlayersManager().setIsSubmitted(true);

            this.setState(game, new TeamVotingState());
          }, this.waitTimes.afterTeamProposition);

          break;
      }
    });

    this.fsm.on(GameState.TeamVotingPreApproved, (from: GameState) => {
      switch (from) {
        case GameState.TeamProposition:
          this.setState(game, new FrozenState());

          this.waitFor(() => {
            game.getPlayersManager().setIsSubmitted(true);

            this.setState(game, new TeamVotingState());

            this.simulateTeamApproval(game);
          }, this.waitTimes.afterTeamProposition);

          break;
      }
    });

    this.fsm.on(GameState.QuestVoting, (from: GameState) => {
      switch (from) {
        case GameState.TeamVotingPreApproved:
        case GameState.TeamVoting:
          this.setState(game, new FrozenState());

          this.waitFor(() => {
            game.getPlayersManager().resetVotes();

            this.setState(game, new QuestVotingState());
          }, this.waitTimes.afterTeamVoting);

          break;
      }
    });

    this.fsm.on(GameState.Assassination, (from: GameState) => {
      switch (from) {
        case GameState.QuestVoting:
          this.setState(game, new FrozenState());

          this.waitFor(() => {
            game.getPlayersManager().reset();

            this.setState(game, new AssassinationState());
          }, this.waitTimes.afterQuestVoting);

          break;
      }
    });

    this.fsm.on(GameState.GameLost, (from: GameState) => {
      switch (from) {
        case GameState.QuestVoting:
        case GameState.Assassination:
          game.getMetaData().finish(GameStatus.Lost);

          this.setState(game, new FinishState());

          break;
      }
    });

    this.fsm.on(GameState.GameWon, (from: GameState) => {
      switch (from) {
        case GameState.Assassination:
          game.getMetaData().finish(GameStatus.Won);

          this.setState(game, new FinishState());

          break;
      }
    });
  }

  private waitFor(cb: () => void, timeoutMs: number) {
    if (!timeoutMs) {
      cb();

      return;
    }

    setTimeout(() => cb(), timeoutMs);
  }

  private setState(game: Game, state: BaseState) {
    game.setState(state);

    this.eventEmitter.emit('stateChange');
  }

  private simulateTeamApproval(game: Game) {
    game.getPlayersManager()
      .getAll()
      .forEach((player) => {
        game.voteForTeam(player.getUsername(), true);
      });
  }

  transitionTo(state: GameState) {
    this.fsm.go(state);
  }

  on(gameEvent: GameEvent, cb: () => void) {
    this.eventEmitter.addListener(gameEvent, cb);
  }

  off(gameEvent: GameEvent, cb: () => void) {
    this.eventEmitter.removeListener(gameEvent, cb);
  }
}
