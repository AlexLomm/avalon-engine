import { GameStateMachine, GameState } from '../../src/game-states/game-state-machine';
import { Game } from '../../src/game';
import { PlayersManager } from '../../src/players-manager';
import { addPlayersToGame } from '../helpers/game';

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

    game    = new Game();
    machine = new GameStateMachine({
      afterTeamProposition: 5000,
      afterTeamVoting: 5000,
      afterQuestVoting: 5000,
    });
    machine.init(game, GameState.TeamVoting);
  });

  test('should return a promise upon transition', () => {
    expect(machine.transitionTo(GameState.TeamProposition)).toBeInstanceOf(Promise);
  });

  test('should set a game state', () => {
    machine.transitionTo(GameState.QuestVoting);

    const spy = jest.spyOn(game, 'setState');

    jest.runAllTimers();

    expect(spy).toBeCalled();
  });

  test('should be called exactly after the specified time', () => {
    machine.transitionTo(GameState.QuestVoting);

    const spy = jest.spyOn(game, 'setState');

    jest.advanceTimersByTime(4500);

    expect(spy).not.toBeCalled();

    jest.advanceTimersByTime(500);

    expect(spy).toBeCalled();
  });
});

describe('transition timings', () => {
  test.each`
    from  | to | expectedWaitTime | actualWaitTime
    
    ${GameState.TeamProposition}  | ${GameState.TeamVoting}             | ${1000} | ${{afterTeamProposition: 1000}}
    ${GameState.TeamProposition}  | ${GameState.TeamVotingPreApproved}  | ${1000} | ${{afterTeamProposition: 1000}}
    
    ${GameState.TeamVoting}  | ${GameState.TeamProposition}  | ${1000} | ${{afterTeamVoting: 1000}}
    ${GameState.TeamVoting}  | ${GameState.QuestVoting}      | ${1000} | ${{afterTeamVoting: 1000}}
    
    ${GameState.TeamVotingPreApproved}  | ${GameState.QuestVoting}      | ${1000} | ${{afterTeamVoting: 1000}}
    
    ${GameState.QuestVoting}  | ${GameState.TeamProposition}  | ${1000} | ${{afterQuestVoting: 1000}}
    ${GameState.QuestVoting}  | ${GameState.Assassination}    | ${1000} | ${{afterQuestVoting: 1000}}
  `('transition from $from to $to should happen exactly after $expectedWaitTime ms',
    ({from, to, expectedWaitTime, actualWaitTime}) => {
      jest.useFakeTimers();

      const defaultWaitTimes = {
        afterTeamProposition: 5000,
        afterTeamVoting: 5000,
        afterQuestVoting: 5000,
      };

      const game    = new Game();
      const machine = new GameStateMachine({
        ...defaultWaitTimes,
        ...actualWaitTime,
      });
      machine.init(game, from);

      machine.transitionTo(to);

      const spy = jest.spyOn(game, 'setState');

      jest.advanceTimersByTime(expectedWaitTime * 0.95);

      expect(spy).not.toBeCalled();

      jest.advanceTimersByTime(expectedWaitTime * 0.05);

      expect(spy).toBeCalled();
    },
  );

  test.each`
    from                        | to
    ${GameState.Preparation}    | ${GameState.TeamProposition}}
    ${GameState.Assassination}  | ${GameState.Finish}}
    ${GameState.QuestVoting}    | ${GameState.Finish}}
  `('transition from $from to $to should happen instantly',
    ({from, to}) => {
      jest.useFakeTimers();

      const game    = new Game();
      const machine = new GameStateMachine({
        afterTeamProposition: 5000,
        afterTeamVoting: 5000,
        afterQuestVoting: 5000,
      });
      machine.init(game, from);

      const spy = jest.spyOn(game, 'setState');

      machine.transitionTo(to);

      expect(spy).toBeCalledTimes(1);
    },
  );
});
