import * as _ from 'lodash';
import * as fromErrors from '../src/errors';
import { RoleId } from '../src/configs/roles.config';
import { Game } from '../src/game';
import { PlayersManager } from '../src/players-manager';
import { QuestsManager, GameStatus } from '../src/quests-manager';
import { Player } from '../src/player';

describe('initialization', () => {
  test('should contain a meta data object', () => {
    const game = new Game();

    expect(game.getMetaData()).toBeTruthy();
  });
});

describe('game start', () => {
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

  beforeEach(() => {
    jest.useFakeTimers();

    playersManager = new PlayersManager();
    questsManager  = new QuestsManager();
    game           = new Game(playersManager, questsManager);

    _.times(7, (i) => game.addPlayer(new Player(`user-${i}`)));

    game.start();

    jest.runAllTimers();
  });

  const passQuestsWithResults = (results: boolean[] = []) => {
    _.times(results.length, () => {
      const usernames: string[] = [];

      _.times(
        questsManager.getCurrentQuest().getVotesNeeded(),
        (i) => usernames.push(`user-${i}`),
      );

      proposeAndSubmitTeam(usernames);

      voteAllForTeam(true);

      voteAllForQuest(true);
    });
  };

  const proposeAndSubmitTeam = (usernames: string[] = []) => {
    const leaderUsername = playersManager.getLeader().getUsername();

    proposePlayers(usernames);

    game.submitTeam(leaderUsername);
  };

  const proposePlayers = (usernames: string[] = []) => {
    const leaderUsername = playersManager.getLeader().getUsername();

    usernames.forEach((username) => {
      game.toggleTeammateProposition(leaderUsername, username);
    });
  };

  const voteAllForTeam = (voteValue: boolean) => {
    playersManager.getAll()
      .forEach(p => game.voteForTeam(p.getUsername(), voteValue));
  };

  const voteAllForQuest = (voteValue: boolean) => {
    playersManager.getProposedPlayers()
      .forEach(p => game.voteForQuest(p.getUsername(), voteValue));
  };

  const getNonAssassin = () => {
    return playersManager.getAll().find(
      (p) => p.getUsername() !== playersManager.getAssassin().getUsername(),
    );
  };

  const getMerlin = () => {
    return playersManager.getAll().find(
      (p) => p.getRole().getId() === RoleId.Merlin,
    );
  };

  const getNonAssassinNonMerlin = () => {
    return playersManager.getAll()
      .find(p => {
        return p.getUsername() !== playersManager.getAssassin().getUsername()
          && p.getRole().getId() !== RoleId.Merlin;
      });
  };

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
      proposeAndSubmitTeam(['user-1', 'user-2']);

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
      proposePlayers(['user-1', 'user-2']);

      expect(playersManager.getIsSubmitted()).toBeFalsy();

      game.submitTeam(playersManager.getLeader().getUsername());

      expect(playersManager.getIsSubmitted()).toBeTruthy();
    });
  });

  describe('team voting', () => {
    test('should only allow to vote when the team is submitted', () => {
      proposePlayers(['user-1', 'user-2']);

      expect(() => game.voteForTeam('user-1', true))
        .toThrow(fromErrors.NoTimeForTeamVotingError);

      game.submitTeam(playersManager.getLeader().getUsername());

      expect(() => game.voteForTeam('user-1', false)).not.toThrow();
    });

    test('should only allow to vote to an existing player', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      expect(() => game.voteForTeam('user-3', true)).not.toThrow();
      expect(() => game.voteForTeam('nonexistent', true))
        .toThrow(fromErrors.DeniedTeamVotingError);
    });

    test('should only allow voting once', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      game.voteForTeam('user-1', true);

      expect(() => game.voteForTeam('user-1', true))
        .toThrow(fromErrors.DeniedTeamVotingError);
    });

    test('should persist the vote in quest history', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      jest.spyOn(questsManager, 'addVote');
      game.voteForTeam('user-1', true);

      expect(questsManager.addVote).toBeCalledTimes(1);
    });

    test('should reset the votes when the team voting was successful', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      jest.spyOn(questsManager, 'addVote');

      voteAllForTeam(true);

      expect(playersManager.getAll()[0].getVote()).toBeFalsy();
    });

    test('should reset the votes even when the team got rejected', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      jest.spyOn(questsManager, 'addVote');

      voteAllForTeam(false);

      expect(playersManager.getAll()[0].getVote()).toBeFalsy();
    });

    test('should unmark the team as "submitted" if it got rejected', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      voteAllForTeam(false);

      expect(playersManager.getIsSubmitted()).toBeFalsy();
    });

    test('should unmark the players as "proposed" if it got rejected', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      voteAllForTeam(false);

      expect(playersManager.getProposedPlayers().length).toStrictEqual(0);
    });

    test('should automatically vote affirmatively in case it is the last round of voting', () => {
      _.times(4, () => {
        proposeAndSubmitTeam(['user-1', 'user-2']);

        voteAllForTeam(false);
      });

      proposeAndSubmitTeam(['user-1', 'user-2']);

      // the voting should be over and the
      // quest voting should have started
      expect(() => game.voteForTeam('user-1', false))
        .toThrow(fromErrors.NoTimeForTeamVotingError);
    });
  });

  describe('quest voting', () => {
    test('should throw when attempting to vote for the quest if the team voting has failed', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      expect(() => game.voteForQuest('user-1', true))
        .toThrow(fromErrors.NoTimeForQuestVotingError);

      voteAllForTeam(false);

      expect(() => game.voteForQuest('user-1', true))
        .toThrow(fromErrors.NoTimeForQuestVotingError);
    });

    test('should not throw when attempting to vote for the quest if the team voting has succeeded', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      voteAllForTeam(true);

      expect(() => game.voteForQuest('user-1', true))
        .not
        .toThrow(fromErrors.NoTimeForQuestVotingError);
    });

    test('should throw when attempting to vote for the quest, after the quest voting has completed', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      voteAllForTeam(true);

      voteAllForQuest(false);

      expect(() => game.voteForQuest('user-1', true))
        .toThrow(fromErrors.NoTimeForQuestVotingError);
    });

    test('should only allow a proposed player to vote on a quest', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      voteAllForTeam(true);

      expect(() => game.voteForQuest('user-1', true)).not.toThrow();
      expect(() => game.voteForQuest('user-4', true)).toThrow(fromErrors.DeniedQuestVotingError);
      expect(() => game.voteForQuest('nonexistent', true)).toThrow(fromErrors.DeniedQuestVotingError);
    });

    test('should only allow a player to vote on a quest once', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      voteAllForTeam(true);

      game.voteForQuest('user-1', true);
      expect(() => game.voteForQuest('user-1', true))
        .toThrow(fromErrors.DeniedQuestVotingError);
    });

    test('should persist the vote in the quest history', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      voteAllForTeam(true);

      jest.spyOn(questsManager, 'addVote');

      game.voteForQuest('user-1', true);

      expect(questsManager.addVote).toBeCalledTimes(1);
    });

    test('should reset the votes after every proposed player has voted', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      voteAllForTeam(true);

      voteAllForQuest(false);

      const playersWhoVotedCount = playersManager.getAll().filter(p => p.getVote()).length;

      expect(playersWhoVotedCount).toStrictEqual(0);
    });

    test('should move to the next quest, after the quest voting has failed', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      const previousQuest = questsManager.getCurrentQuest();

      voteAllForTeam(true);

      voteAllForQuest(false);

      expect(previousQuest).not.toBe(questsManager.getCurrentQuest());
    });

    test('should move to the next quest, after the quest voting has been successful', () => {
      proposeAndSubmitTeam(['user-1', 'user-2']);

      const previousQuest = questsManager.getCurrentQuest();

      voteAllForTeam(true);

      voteAllForQuest(false);

      expect(previousQuest).not.toBe(questsManager.getCurrentQuest());
    });
  });

  describe('assassination', () => {
    test('should throw if it is not an appropriate time to propose a victim', () => {
      const assassin = playersManager.getAssassin();
      const victim   = getNonAssassin();

      expect(() => game.toggleVictimProposition(
        assassin.getUsername(),
        victim.getUsername()),
      ).toThrow(fromErrors.NoTimeVictimPropositionError);

      passQuestsWithResults([true, true, true]);

      expect(() => game.toggleVictimProposition(
        assassin.getUsername(),
        victim.getUsername()),
      )
        .not
        .toThrow(fromErrors.NoTimeVictimPropositionError);
    });

    test('should toggle assassination victim', () => {
      const assassin = playersManager.getAssassin();
      const victim   = getNonAssassin();

      passQuestsWithResults([true, true, true]);

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
      const assassin = playersManager.getAssassin();

      expect(() => game.assassinate(assassin.getUsername()))
        .toThrow(fromErrors.NoTimeForAssassinationError);

      passQuestsWithResults([true, true, true]);

      expect(() => game.assassinate(assassin.getUsername()))
        .not
        .toThrow(fromErrors.NoTimeForAssassinationError);
    });

    test('should persist assassination results', () => {
      const assassin = playersManager.getAssassin();
      const victim   = getNonAssassin();

      passQuestsWithResults([true, true, true]);

      jest.spyOn(playersManager, 'assassinate');
      jest.spyOn(questsManager, 'setAssassinationStatus');

      game.toggleVictimProposition(assassin.getUsername(), victim.getUsername());
      game.assassinate(assassin.getUsername());

      expect(playersManager.assassinate).toBeCalledTimes(1);
      expect(questsManager.setAssassinationStatus).toBeCalledTimes(1);
    });

    test('should set the game status to "0", if the victim was Merlin', () => {
      const assassin = playersManager.getAssassin();
      const merlin   = getMerlin();

      passQuestsWithResults([true, true, true]);

      game.toggleVictimProposition(assassin.getUsername(), merlin.getUsername());
      game.assassinate(assassin.getUsername());

      expect(questsManager.getGameStatus()).toStrictEqual(GameStatus.Lost);
    });

    test('should set the game status to "1", if the victim was not Merlin', () => {
      const assassin  = playersManager.getAssassin();
      const nonMerlin = getNonAssassinNonMerlin();

      passQuestsWithResults([true, true, true]);

      game.toggleVictimProposition(assassin.getUsername(), nonMerlin.getUsername());
      game.assassinate(assassin.getUsername());

      expect(questsManager.getGameStatus()).toStrictEqual(GameStatus.Won);
    });
  });

  // describe('serialization', () => {
  //   test('should serialize initial game object', () => {
  //     const playersManager = new PlayersManager();
  //     const questsManager  = new QuestsManager();
  //     const game           = new Game(playersManager, questsManager);
  //
  //     fail();
  //
  //     const expected = {
  //       meta: {
  //         finishedAt: game.getFinishedAt(),
  //         startedAt: game.getStartedAt(),
  //         ...(LevelPreset.null().serialize()),
  //       },
  //       ...playersManager.serializeFor('user-1', true),
  //       ...questsManager.serialize(),
  //     };
  //
  //     const actual = game.serialize();
  //
  //     expect(actual).toEqual(expected);
  //   });
  //
  //   test('should contain the correct meta', () => {
  //     passQuestsWithResults([true, true, true]);
  //
  //     const serializedState = game.serialize();
  //
  //     expect(serializedState.meta).toEqual({
  //       finishedAt: game.getFinishedAt(),
  //       startedAt: game.getStartedAt(),
  //       ...(game.getLevelPreset().serialize()),
  //     });
  //   });
  //
  //   test('should contain serialized players manager', () => {
  //     passQuestsWithResults([true, true, false]);
  //
  //     const serializedState = game.serialize();
  //
  //     fail();
  //
  //     expect(serializedState).toEqual({
  //       ...serializedState,
  //       // ...playersManager.serializeFor()
  //     });
  //   });
  //
  //   test('should contain serialized quests manager', () => {
  //     passQuestsWithResults([true, true, false]);
  //
  //     const serializedState = game.serialize();
  //
  //     expect(serializedState).toEqual({
  //       ...serializedState,
  //       ...questsManager.serialize()
  //     });
  //   });
  // });
});
