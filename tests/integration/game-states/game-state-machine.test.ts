import { GameStateMachine } from '../../../src/game-states/game-state-machine';
import { Game } from '../../../src/game';
import { GameState } from '../../../src/enums/game-state';
import { GameEvent } from '../../../src/enums/game-event';
import { GameStateTransitionWaitTimes } from '../../../src/types/game-state-transition-wait-times';

describe('initialization', () => {
  test('should throw an error upon transition the machine is not initialized', () => {
    const machine = new GameStateMachine();

    expect(() => machine.transitionTo(GameState.TeamProposition)).toThrow();

    const game = new Game();
    machine.init(game);

    expect(() => machine.transitionTo(GameState.TeamProposition)).not.toThrow();
  });
});

describe('transition', () => {
  let game: Game;
  let machine: GameStateMachine;
  beforeEach(() => {
    jest.useFakeTimers();

    game = new Game();
    machine = new GameStateMachine({
      afterTeamProposition: 5000,
      afterTeamVoting: 5000,
      afterQuestVoting: 5000,
    });
    machine.init(game, GameState.TeamVoting);
  });

  test('should set a game state', () => {
    machine.transitionTo(GameState.QuestVoting);

    const spy = jest.spyOn(game, 'setState');

    jest.runAllTimers();

    expect(spy).toHaveBeenCalled();
  });

  test('should be called exactly after the specified time', () => {
    machine.transitionTo(GameState.QuestVoting);

    const spy = jest.spyOn(game, 'setState');

    jest.advanceTimersByTime(4500);

    expect(spy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(spy).toHaveBeenCalled();
  });
});

describe('events', () => {
  let game: Game;
  let machine: GameStateMachine;
  beforeEach(() => {
    jest.useFakeTimers();

    game = new Game();
    machine = new GameStateMachine();
  });

  test('should add an event listener', () => {
    machine.init(game, GameState.Preparation);

    let i = 0;

    machine.on(GameEvent.StateChange, () => i++);

    machine.transitionTo(GameState.TeamProposition);

    expect(i).toStrictEqual(1);
  });

  test('should remove an event listener', () => {
    machine.init(game, GameState.Preparation);

    let i = 0;

    const listener = () => i++;
    machine.on(GameEvent.StateChange, listener);
    machine.off(GameEvent.StateChange, listener);

    machine.transitionTo(GameState.TeamProposition);

    expect(i).toStrictEqual(0);
  });
});

describe('timed transitions', () => {
  const timedTransitions = [
    {
      from: GameState.TeamProposition,
      to: GameState.TeamVoting,
      expectedWait: 1000,
      actualWait: { afterTeamProposition: 1000 },
    },
    {
      from: GameState.TeamProposition,
      to: GameState.TeamVotingPreApproved,
      expectedWait: 1000,
      actualWait: { afterTeamProposition: 1000 },
    },
    {
      from: GameState.TeamVoting,
      to: GameState.TeamProposition,
      expectedWait: 1000,
      actualWait: { afterTeamVoting: 1000 },
    },
    {
      from: GameState.TeamVoting,
      to: GameState.QuestVoting,
      expectedWait: 1000,
      actualWait: { afterTeamVoting: 1000 },
    },
    {
      from: GameState.TeamVotingPreApproved,
      to: GameState.QuestVoting,
      expectedWait: 1000,
      actualWait: { afterTeamVoting: 1000 },
    },
    {
      from: GameState.QuestVoting,
      to: GameState.TeamProposition,
      expectedWait: 1000,
      actualWait: { afterQuestVoting: 1000 },
    },
    {
      from: GameState.QuestVoting,
      to: GameState.Assassination,
      expectedWait: 1000,
      actualWait: { afterQuestVoting: 1000 },
    },
  ];

  let game: Game;
  let defaultWait: GameStateTransitionWaitTimes;
  beforeEach(() => {
    jest.useFakeTimers();

    defaultWait = {
      afterTeamProposition: 5000,
      afterTeamVoting: 5000,
      afterQuestVoting: 5000,
    };

    game = new Game();
  });

  timedTransitions.forEach(({ from, to, expectedWait, actualWait }) => {
    test(`should transition from ${from} to ${to} in exactly ${expectedWait}ms`, () => {
      const machine = new GameStateMachine({
        ...defaultWait,
        ...actualWait,
      });
      machine.init(game, from);

      machine.transitionTo(to);

      const spy = jest.spyOn(game, 'setState');

      jest.advanceTimersByTime(expectedWait * 0.95);

      expect(spy).not.toHaveBeenCalled();

      jest.advanceTimersByTime(expectedWait * 0.05);

      expect(spy).toHaveBeenCalled();
    });
  });

  timedTransitions.forEach(({ from, to }) => {
    test(`should fire an event twice, while transitioning from ${from} to ${to}`, () => {
      const machine = new GameStateMachine(defaultWait);

      machine.init(game, from);

      let i = 0;

      machine.on(GameEvent.StateChange, () => i++);

      machine.transitionTo(to);

      expect(i).toStrictEqual(1);

      jest.advanceTimersByTime(4900);

      expect(i).toStrictEqual(1);

      jest.advanceTimersByTime(100);

      expect(i).toStrictEqual(2);
    });
  });
});

describe('instant transitions', () => {
  const instantTransitions = [
    { from: GameState.Preparation, to: GameState.TeamProposition },
    { from: GameState.Assassination, to: GameState.GameLost },
    { from: GameState.Assassination, to: GameState.GameWon },
    { from: GameState.QuestVoting, to: GameState.GameLost },
  ];

  let game: Game;
  let machine: GameStateMachine;
  beforeEach(() => {
    jest.useFakeTimers();

    game = new Game();

    machine = new GameStateMachine({
      afterTeamProposition: 5000,
      afterTeamVoting: 5000,
      afterQuestVoting: 5000,
    });
  });

  instantTransitions.forEach(({ from, to }) => {
    test(`should transition from ${from} to ${to} instantly`, () => {
      machine.init(game, from);

      const spy = jest.spyOn(game, 'setState');

      machine.transitionTo(to);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  instantTransitions.forEach(({ from, to }) => {
    test(`should fire an event, while transitioning from ${from} to ${to}`, () => {
      machine.init(game, from);

      let i = 0;

      machine.on(GameEvent.StateChange, () => i++);

      expect(i).toStrictEqual(0);

      machine.transitionTo(to);

      expect(i).toStrictEqual(1);
    });
  });
});
