import * as _ from 'lodash';
import * as fromErrors from '../src/errors';
import { Game } from '../src/game';
import { PlayersManager } from '../src/players-manager';
import { QuestsManager } from '../src/quests-manager';
import { Player } from '../src/player';
import { PreparationState } from '../src/game-states/preparation-state';
import { GameMetaData, GameStatus } from '../src/game-meta-data';
import { GameStateMachine, GameState, GameEvent } from '../src/game-states/game-state-machine';
import { GameHelper } from './helpers/game.helper';
import { PlayersManagerHelper } from './helpers/players-manager.helper';

describe('initialization', () => {
  test('should contain a meta data object', () => {
    const game = new Game();

    expect(game.getMetaData()).toBeTruthy();
  });
});

describe('game start', () => {
  test('should set a creator', () => {
    const game = new Game();

    jest.spyOn(game.getMetaData(), 'setCreatorOnce');

    game.addPlayer(new Player('user-1'));

    expect(game.getMetaData().setCreatorOnce).toBeCalled();
  });

  test('should not add a player when the game is started', () => {
    const game = new Game();

    _.times(5, (i) => game.addPlayer(new Player(`user-${i}`)));

    game.start();

    expect(() => game.addPlayer(new Player('user-6')))
      .toThrow(fromErrors.AlreadyStartedGameError);
  });

  test('should not start the game if the player count is not enough', () => {
    const game = new Game();

    _.times(4, (i) => game.addPlayer(new Player(`user-${i}`)));

    expect(() => game.start()).toThrow(fromErrors.PlayersAmountIncorrectError);
  });

  test('should assign roles', () => {
    const playersManager = new PlayersManager();
    const game           = new Game(playersManager);
    jest.spyOn(playersManager, 'assignRoles');

    _.times(5, (i) => game.addPlayer(new Player(`user-${i}`)));

    expect(playersManager.assignRoles).toBeCalledTimes(0);

    game.start();

    expect(playersManager.assignRoles).toBeCalledTimes(1);
  });

  test('should initialize quests', () => {
    const questsManager = new QuestsManager();
    const game          = new Game(new PlayersManager(), questsManager);
    jest.spyOn(questsManager, 'init');

    _.times(5, (i) => game.addPlayer(new Player(`user-${i}`)));

    expect(questsManager.init).toBeCalledTimes(0);

    game.start();

    expect(questsManager.init).toBeCalledTimes(1);
  });
});

describe('post "reveal roles" phase', () => {
  let game: Game;
  let playersManager: PlayersManager;
  let questsManager: QuestsManager;

  beforeEach(async () => {
    playersManager = new PlayersManager();
    questsManager  = new QuestsManager();
    game           = new Game(
      playersManager,
      questsManager,
      new PreparationState(),
      new GameMetaData(),
      new GameStateMachine({
        afterTeamProposition: 0,
        afterTeamVoting: 0,
        afterQuestVoting: 0,
      }),
    );

    GameHelper.fillPlayers(game, 5);

    game.start();
  });

  describe('team proposition', () => {
    test('should disallow anybody other then the party leader to propose a player', () => {
      const leader = playersManager.getLeader();
      expect(() => game.toggleTeammateProposition(leader.getUsername(), 'user-3'))
        .not
        .toThrow();

      const nonLeader = playersManager.getAll()
        .find(player => player.getUsername() !== leader.getUsername());

      expect(() => {
        game.toggleTeammateProposition(nonLeader.getUsername(), 'user-3');
      }).toThrow(fromErrors.DeniedTeammatePropositionError);
    });

    test('should toggle whether a player is proposed or not', () => {
      const leader = playersManager.getLeader();

      jest.spyOn(playersManager, 'togglePlayerProposition');

      game.toggleTeammateProposition(leader.getUsername(), 'user-3');

      expect(playersManager.togglePlayerProposition).toBeCalledTimes(1);
    });

    test('should disallow any further propositions once the team is submitted', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      expect(() => game.toggleTeammateProposition(
        playersManager.getLeader().getUsername(),
        'user-2',
      )).toThrow(fromErrors.NoTimeForTeammatePropositionError);
    });
  });

  describe('team submission', () => {
    test('should disallow team submission by a non-leader player', () => {
      const leader    = playersManager.getLeader();
      const nonLeader = playersManager.getAll()
        .find(p => p.getUsername() !== leader.getUsername());

      expect(() => game.submitTeam(nonLeader.getUsername()))
        .toThrow(fromErrors.DeniedTeamSubmissionError);
    });

    test('should disallow submission if not enough players are proposed', () => {
      const leaderUsername = playersManager.getLeader().getUsername();

      expect(() => game.submitTeam(leaderUsername))
        .toThrow(fromErrors.RequiredCorrectTeammatesAmountError);

      game.toggleTeammateProposition(leaderUsername, 'user-1');

      expect(() => game.submitTeam(leaderUsername))
        .toThrow(fromErrors.RequiredCorrectTeammatesAmountError);

      game.toggleTeammateProposition(leaderUsername, 'user-2');

      expect(game.submitTeam(leaderUsername));
    });

    test('should submit proposed players', () => {
      GameHelper.proposePlayers(game, ['user-1', 'user-2']);

      expect(playersManager.getIsSubmitted()).toBeFalsy();

      game.submitTeam(playersManager.getLeader().getUsername());

      expect(playersManager.getIsSubmitted()).toBeTruthy();
    });
  });

  describe('team voting', () => {
    test('should only allow to vote when the team is submitted', () => {
      GameHelper.proposePlayers(game, ['user-1', 'user-2']);

      expect(() => game.voteForTeam('user-1', true))
        .toThrow(fromErrors.NoTimeForTeamVotingError);

      game.submitTeam(playersManager.getLeader().getUsername());

      expect(() => game.voteForTeam('user-1', false)).not.toThrow();
    });

    test('should only allow to vote to an existing player', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      expect(() => game.voteForTeam('user-3', true)).not.toThrow();
      expect(() => game.voteForTeam('nonexistent', true))
        .toThrow(fromErrors.DeniedTeamVotingError);
    });

    test('should only allow voting once', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      game.voteForTeam('user-1', true);

      expect(() => game.voteForTeam('user-1', true))
        .toThrow(fromErrors.DeniedTeamVotingError);
    });

    test('should persist the vote in quest history', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      jest.spyOn(questsManager, 'addVote');
      game.voteForTeam('user-1', true);

      expect(questsManager.addVote).toBeCalledTimes(1);
    });

    test('should reset the votes when the team voting was successful', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      jest.spyOn(questsManager, 'addVote');

      GameHelper.voteAllForTeam(game, true);

      expect(playersManager.getAll()[0].getVote()).toBeFalsy();
    });

    test('should reset the votes even when the team got rejected', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      jest.spyOn(questsManager, 'addVote');

      GameHelper.voteAllForTeam(game, false);

      expect(playersManager.getAll()[0].getVote()).toBeFalsy();
    });

    test('should unmark the team as "submitted" if it got rejected', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      GameHelper.voteAllForTeam(game, false);

      expect(playersManager.getIsSubmitted()).toBeFalsy();
    });

    test('should unmark the players as "proposed" if it got rejected', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      GameHelper.voteAllForTeam(game, false);

      expect(playersManager.getProposedPlayersCount()).toStrictEqual(0);
    });

    test('should automatically vote affirmatively in case it is the last round of voting', () => {
      _.times(4, () => {
        GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

        GameHelper.voteAllForTeam(game, false);
      });

      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      // the voting should be over and the
      // quest voting should have started
      expect(() => game.voteForTeam('user-1', false))
        .toThrow(fromErrors.NoTimeForTeamVotingError);
    });
  });

  describe('quest voting', () => {
    test('should throw when attempting to vote for the quest if the team voting has failed', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      expect(() => game.voteForQuest('user-1', true))
        .toThrow(fromErrors.NoTimeForQuestVotingError);

      GameHelper.voteAllForTeam(game, false);

      expect(() => game.voteForQuest('user-1', true))
        .toThrow(fromErrors.NoTimeForQuestVotingError);
    });

    test('should not throw when attempting to vote for the quest if the team voting has succeeded', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      GameHelper.voteAllForTeam(game, true);

      expect(() => game.voteForQuest('user-1', true))
        .not
        .toThrow(fromErrors.NoTimeForQuestVotingError);
    });

    test('should throw when attempting to vote for the quest, after the quest voting has completed', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      GameHelper.voteAllForTeam(game, true);

      GameHelper.voteAllForQuest(game, false);

      expect(() => game.voteForQuest('user-1', true))
        .toThrow(fromErrors.NoTimeForQuestVotingError);
    });

    test('should only allow a proposed player to vote on a quest', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      GameHelper.voteAllForTeam(game, true);

      expect(() => game.voteForQuest('user-1', true)).not.toThrow();
      expect(() => game.voteForQuest('user-4', true)).toThrow(fromErrors.DeniedQuestVotingError);
      expect(() => game.voteForQuest('nonexistent', true)).toThrow(fromErrors.DeniedQuestVotingError);
    });

    test('should only allow a player to vote on a quest once', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      GameHelper.voteAllForTeam(game, true);

      game.voteForQuest('user-1', true);
      expect(() => game.voteForQuest('user-1', true))
        .toThrow(fromErrors.DeniedQuestVotingError);
    });

    test('should persist the vote in the quest history', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      GameHelper.voteAllForTeam(game, true);

      jest.spyOn(questsManager, 'addVote');

      game.voteForQuest('user-1', true);

      expect(questsManager.addVote).toBeCalledTimes(1);
    });

    test('should reset the votes after every proposed player has voted', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      GameHelper.voteAllForTeam(game, true);

      GameHelper.voteAllForQuest(game, false);

      const playersWhoVotedCount = playersManager.getAll().filter(p => p.getVote()).length;

      expect(playersWhoVotedCount).toStrictEqual(0);
    });

    test('should move to the next quest, after the quest voting has failed', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      const previousQuest = questsManager.getCurrentQuest();

      GameHelper.voteAllForTeam(game, true);

      GameHelper.voteAllForQuest(game, false);

      expect(previousQuest).not.toBe(questsManager.getCurrentQuest());
    });

    test('should move to the next quest, after the quest voting has been successful', () => {
      GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);

      const previousQuest = questsManager.getCurrentQuest();

      GameHelper.voteAllForTeam(game, true);

      GameHelper.voteAllForQuest(game, false);

      expect(previousQuest).not.toBe(questsManager.getCurrentQuest());
    });

    test('should transition to the assassination phase, if at least 3 quests succeeded', () => {
      GameHelper.passQuestsWithResults(game, [true, true]);

      jest.spyOn(game.getFsm(), 'transitionTo');

      GameHelper.passQuestsWithResults(game, [true]);

      expect(game.getFsm().transitionTo).toBeCalledWith(GameState.Assassination);
    });

    test('should set the game status to "Lost", if there are at least 3 failed quests', () => {
      GameHelper.passQuestsWithResults(game, [false, false]);

      expect(game.getMetaData().getGameStatus()).toEqual(GameStatus.Unfinished);

      GameHelper.passQuestsWithResults(game, [false]);

      expect(game.getMetaData().getGameStatus()).toEqual(GameStatus.Lost);
    });
  });

  describe('assassination', () => {
    test('should throw if it is not an appropriate time to propose a victim', () => {
      const assassin = PlayersManagerHelper.getAssassin(playersManager);
      const victim   = PlayersManagerHelper.getNonAssassin(playersManager);

      expect(() => game.toggleVictimProposition(
        assassin.getUsername(),
        victim.getUsername()),
      ).toThrow(fromErrors.NoTimeVictimPropositionError);

      GameHelper.passQuestsWithResults(game, [true, true, true]);

      expect(() => {
        game.toggleVictimProposition(
          assassin.getUsername(),
          victim.getUsername(),
        );
      }).not
        .toThrow(fromErrors.NoTimeVictimPropositionError);
    });

    test('should toggle the victim selection', () => {
      const assassin = PlayersManagerHelper.getAssassin(playersManager);
      const victim   = PlayersManagerHelper.getNonAssassin(playersManager);

      GameHelper.passQuestsWithResults(game, [true, true, true]);

      jest.spyOn(playersManager, 'toggleVictimProposition');

      game.toggleVictimProposition(
        assassin.getUsername(),
        victim.getUsername(),
      );

      expect(playersManager.toggleVictimProposition).toBeCalledTimes(1);
      expect(playersManager.toggleVictimProposition)
        .toBeCalledWith(assassin.getUsername(), victim.getUsername());
    });

    test('should throw if it is not an appropriate time for assassination', () => {
      const assassin = PlayersManagerHelper.getAssassin(playersManager);

      expect(() => game.assassinate(assassin.getUsername()))
        .toThrow(fromErrors.NoTimeForAssassinationError);

      GameHelper.passQuestsWithResults(game, [true, true, true]);

      expect(() => game.assassinate(assassin.getUsername()))
        .not
        .toThrow(fromErrors.NoTimeForAssassinationError);
    });

    test('should persist assassination results', () => {
      const assassin = PlayersManagerHelper.getAssassin(playersManager);
      const victim   = PlayersManagerHelper.getNonAssassin(playersManager);

      GameHelper.passQuestsWithResults(game, [true, true, true]);

      jest.spyOn(playersManager, 'assassinate');
      jest.spyOn(game.getMetaData(), 'finish');

      game.toggleVictimProposition(assassin.getUsername(), victim.getUsername());
      game.assassinate(assassin.getUsername());

      expect(playersManager.assassinate).toBeCalledTimes(1);
      expect(game.getMetaData().finish).toBeCalledTimes(1);
    });

    test('should set the game status to "Lost", if the victim was Merlin', () => {
      const assassin = PlayersManagerHelper.getAssassin(playersManager);
      const merlin   = PlayersManagerHelper.getMerlin(playersManager);

      GameHelper.passQuestsWithResults(game, [true, true, true]);

      game.toggleVictimProposition(assassin.getUsername(), merlin.getUsername());
      game.assassinate(assassin.getUsername());

      expect(game.getMetaData().getGameStatus()).toEqual(GameStatus.Lost);
    });

    test('should set the game status to "Won", if the victim was not Merlin', () => {
      const assassin  = PlayersManagerHelper.getAssassin(playersManager);
      const nonMerlin = PlayersManagerHelper.getNonAssassinNonMerlin(playersManager);

      GameHelper.passQuestsWithResults(game, [true, true, true]);

      game.toggleVictimProposition(assassin.getUsername(), nonMerlin.getUsername());
      game.assassinate(assassin.getUsername());

      expect(game.getMetaData().getGameStatus()).toStrictEqual(GameStatus.Won);
    });
  });
});

describe('serialization', () => {
  let playersManager: PlayersManager;
  let questsManager: QuestsManager;
  let game: Game;
  beforeEach(() => {
    playersManager = new PlayersManager();
    questsManager  = new QuestsManager();
    game           = new Game(
      playersManager,
      questsManager,
      new PreparationState(),
      new GameMetaData(),
      new GameStateMachine({
        afterTeamProposition: 0,
        afterTeamVoting: 0,
        afterQuestVoting: 0,
      }),
    );
  });

  test('should correctly serialize the game in it\'s initial state', () => {
    game.addPlayer(new Player('user-1'));

    const expected = {
      meta: game.getMetaData().serialize(),
      quests: questsManager.serialize(false),
      players: playersManager.serialize('user-1'),
    };

    const actual = game.serialize('user-1');

    expect(actual).toEqual(expected);
  });

  test('should serialize the quests with the appropriate flag set', () => {
    jest.spyOn(game.getQuestsManager(), 'serialize');

    game.addPlayer(new Player('user-1'));

    game.serialize('user-1');

    expect(game.getQuestsManager().serialize).toBeCalledWith(true);
  });
});

describe('event emission', () => {
  let playersManager: PlayersManager;
  let questsManager: QuestsManager;
  let game: Game;
  beforeEach(() => {
    playersManager = new PlayersManager();
    questsManager  = new QuestsManager();
    game           = new Game(
      playersManager,
      questsManager,
      new PreparationState(),
      new GameMetaData(),
      new GameStateMachine({
        afterTeamProposition: 0,
        afterTeamVoting: 0,
        afterQuestVoting: 0,
      }),
    );
  });

  test('should emit on state change', () => {
    let i = 0;

    game.on(GameEvent.StateChange, () => i++);

    game.addPlayer(new Player('user-1'));

    expect(i).toStrictEqual(1);
  });

  test('should remove an event listener', () => {
    let i = 0;

    const listener = () => i++;
    game.on(GameEvent.StateChange, listener);
    game.off(GameEvent.StateChange, listener);

    game.addPlayer(new Player('user-1'));

    expect(i).toStrictEqual(0);
  });
});
