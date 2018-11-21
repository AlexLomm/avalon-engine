import { Game } from '../game';
import { TeamPropositionState } from './team-proposition-state';
import { TeamVotingState } from './team-voting-state';
import { QuestVotingState } from './quest-voting-state';
import { FrozenState } from './frozen-state';
import { TypeState } from 'typestate';
import { AssassinationState } from './assassination-state';

export enum GameState {
  Preparation           = 'Preparation',
  TeamProposition       = 'TeamProposition',
  TeamVoting            = 'TeamVoting',
  TeamVotingPreApproved = 'TeamVotingPreApproved',
  QuestVoting           = 'QuestVoting',
  Assassination         = 'Assassination',
  Finish                = 'Finish',
}

function simulateTeamApproval(game: Game) {
  game.getPlayersManager()
    .getAll()
    .forEach((player) => {
      game.voteForTeam(player.getUsername(), true);
    });
}

export interface AsyncFiniteStateMachine {
  transitionTo(state: GameState): Promise<void>;
}

export interface StateTransitionWaitTimes {
  afterTeamProposition: number,
  afterTeamVoting: number,
  afterQuestVoting: number,
}

// TODO: pass wait amounts for each case from outside
export function createAsyncStateMachine(game: Game, waitTimes: StateTransitionWaitTimes = {
  // TODO: replace hardcoded values with values from config
  afterTeamProposition: 5000,
  afterTeamVoting: 5000,
  afterQuestVoting: 5000,
}): AsyncFiniteStateMachine {
  const fsm = new TypeState.FiniteStateMachine<GameState>(GameState.Preparation);

  /////////////////////////////////////////////////////////////
  // Define transitions between states
  /////////////////////////////////////////////////////////////

  fsm.from(GameState.Preparation).to(GameState.TeamProposition);
  //
  fsm.from(GameState.TeamProposition).to(GameState.TeamVoting);
  fsm.from(GameState.TeamProposition).to(GameState.TeamVotingPreApproved);
  //
  fsm.from(GameState.TeamVoting).to(GameState.TeamProposition);
  fsm.from(GameState.TeamVoting).to(GameState.QuestVoting);
  //
  fsm.from(GameState.TeamVotingPreApproved).to(GameState.QuestVoting);
  //
  fsm.from(GameState.QuestVoting).to(GameState.TeamProposition);
  fsm.from(GameState.QuestVoting).to(GameState.Assassination);
  fsm.from(GameState.QuestVoting).to(GameState.Finish);
  //
  fsm.from(GameState.Assassination).to(GameState.Finish);

  /////////////////////////////////////////////////////////////
  // Register event listeners of the transitions
  /////////////////////////////////////////////////////////////

  fsm.on(GameState.TeamProposition, (from: GameState) => {
    switch (from) {
      case GameState.Preparation:
        game.setState(new TeamPropositionState());

        break;
      case GameState.TeamVoting:
        game.setState(new FrozenState());

        waitFor(() => {
          game.getPlayersManager().reset();

          game.setState(new TeamPropositionState());
        }, waitTimes.afterTeamVoting);

        break;
      case GameState.QuestVoting:
        game.setState(new FrozenState());

        waitFor(() => {
          game.getPlayersManager().reset();

          game.getQuestsManager().nextQuest();

          game.setState(new TeamPropositionState());
        }, waitTimes.afterQuestVoting);

        break;
    }
  });

  fsm.on(GameState.TeamVoting, (from: GameState) => {
    switch (from) {
      case GameState.TeamProposition:
        waitFor(() => {
          game.getPlayersManager().setIsSubmitted(true);

          game.setState(new TeamVotingState());
        }, waitTimes.afterTeamProposition);

        break;
    }
  });

  fsm.on(GameState.TeamVotingPreApproved, (from: GameState) => {
    switch (from) {
      case GameState.TeamProposition:
        waitFor(() => {
          game.getPlayersManager().setIsSubmitted(true);

          game.setState(new TeamVotingState());

          simulateTeamApproval(game);
        }, waitTimes.afterTeamProposition);

        break;
    }
  });

  fsm.on(GameState.QuestVoting, (from: GameState) => {
    switch (from) {
      case GameState.TeamVotingPreApproved:
      case GameState.TeamVoting:
        game.setState(new FrozenState());

        waitFor(() => {
          game.getPlayersManager().resetVotes();

          game.setState(new QuestVotingState());
        }, waitTimes.afterTeamVoting);

        break;
    }
  });

  fsm.on(GameState.Assassination, (from: GameState) => {
    switch (from) {
      case GameState.QuestVoting:
        waitFor(() => {
          game.getPlayersManager().reset();

          game.setState(new AssassinationState());
        }, waitTimes.afterQuestVoting);

        break;
    }
  });

  fsm.on(GameState.Finish, (from: GameState) => {
    switch (from) {
      case GameState.QuestVoting:
      case GameState.Assassination:
        game.setState(new FrozenState());

        break;
    }
  });

  // serves as a temporary variable to hold the promise
  // until it's returned and this variable is cleared
  let _stateUpdatePromise: Promise<void>;

  // creates a promise and assigns it to the temporary variable.
  // the function is needed to "promisify" the synchronous
  // code of the TypeState library
  function waitFor(cb: () => void, ms: number): void {
    _stateUpdatePromise = new Promise((resolve) => {
      setTimeout(() => {
        cb();

        resolve();
      }, ms);
    });
  }

  return {
    transitionTo(state: GameState): Promise<void> {
      fsm.go(state);

      // if the state machine transition produced a promise,
      // return it. Otherwise - return a resolved promise
      const stateUpdatePromise: Promise<void> = _stateUpdatePromise
        ? _stateUpdatePromise
        : Promise.resolve();

      _stateUpdatePromise = null;

      return stateUpdatePromise;
    },
  };
}
