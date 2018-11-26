import { Game } from '../game';
import { TeamPropositionState } from './team-proposition-state';
import { TeamVotingState } from './team-voting-state';
import { QuestVotingState } from './quest-voting-state';
import { FrozenState } from './frozen-state';
import { TypeState } from 'typestate';
import { AssassinationState } from './assassination-state';
import { GameStatus } from '../game-meta-data';

export enum GameState {
  Preparation           = 'Preparation',
  TeamProposition       = 'TeamProposition',
  TeamVoting            = 'TeamVoting',
  TeamVotingPreApproved = 'TeamVotingPreApproved',
  QuestVoting           = 'QuestVoting',
  Assassination         = 'Assassination',
  GameLost              = 'GameLost',
  GameWon               = 'GameWon',
}

export interface GameStateTransitionWaitTimes {
  afterTeamProposition: number,
  afterTeamVoting: number,
  afterQuestVoting: number,
}

export class GameStateMachine {
  private isInit: boolean = false;
  private fsm: TypeState.FiniteStateMachine<GameState>;
  private game: Game;
  //
  private stateUpdatePromise: Promise<void>;

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
          game.setState(new TeamPropositionState());

          break;
        case GameState.TeamVoting:
          game.setState(new FrozenState());

          this.waitFor(() => {
            game.getPlayersManager().reset();

            game.setState(new TeamPropositionState());
          }, this.waitTimes.afterTeamVoting);

          break;
        case GameState.QuestVoting:
          game.setState(new FrozenState());

          this.waitFor(() => {
            game.getPlayersManager().reset();

            game.getQuestsManager().nextQuest();

            game.setState(new TeamPropositionState());
          }, this.waitTimes.afterQuestVoting);

          break;
      }
    });

    this.fsm.on(GameState.TeamVoting, (from: GameState) => {
      switch (from) {
        case GameState.TeamProposition:
          this.waitFor(() => {
            game.getPlayersManager().setIsSubmitted(true);

            game.setState(new TeamVotingState());
          }, this.waitTimes.afterTeamProposition);

          break;
      }
    });

    this.fsm.on(GameState.TeamVotingPreApproved, (from: GameState) => {
      switch (from) {
        case GameState.TeamProposition:
          this.waitFor(() => {
            game.getPlayersManager().setIsSubmitted(true);

            game.setState(new TeamVotingState());

            this.simulateTeamApproval(game);
          }, this.waitTimes.afterTeamProposition);

          break;
      }
    });

    this.fsm.on(GameState.QuestVoting, (from: GameState) => {
      switch (from) {
        case GameState.TeamVotingPreApproved:
        case GameState.TeamVoting:
          game.setState(new FrozenState());

          this.waitFor(() => {
            game.getPlayersManager().resetVotes();

            game.setState(new QuestVotingState());
          }, this.waitTimes.afterTeamVoting);

          break;
      }
    });

    this.fsm.on(GameState.Assassination, (from: GameState) => {
      switch (from) {
        case GameState.QuestVoting:
          this.waitFor(() => {
            game.getPlayersManager().reset();

            game.setState(new AssassinationState());
          }, this.waitTimes.afterQuestVoting);

          break;
      }
    });

    this.fsm.on(GameState.GameLost, (from: GameState) => {
      switch (from) {
        case GameState.QuestVoting:
        case GameState.Assassination:
          game.getMetaData().setGameStatus(GameStatus.Lost);

          game.setState(new FrozenState());

          break;
      }
    });

    this.fsm.on(GameState.GameWon, (from: GameState) => {
      switch (from) {
        case GameState.Assassination:
          game.getMetaData().setGameStatus(GameStatus.Won);

          game.setState(new FrozenState());

          break;
      }
    });
  }

  private waitFor(cb: () => void, ms: number): void {
    this.stateUpdatePromise = new Promise((resolve) => {
      if (!ms) {
        this.handle(cb, resolve);

        return;
      }

      setTimeout(() => this.handle(cb, resolve), ms);
    });
  }

  private handle(cb: () => void, resolve: () => void) {
    cb();

    resolve();
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

    // if the state machine transition produced a promise,
    // return it. Otherwise - return a resolved promise
    const stateUpdatePromise: Promise<void> = this.stateUpdatePromise || Promise.resolve();

    this.stateUpdatePromise = null;

    return stateUpdatePromise;
  }
}
