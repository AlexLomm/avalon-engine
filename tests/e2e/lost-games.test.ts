import { Game } from '../../src/game';
import { GameHelper } from '../helpers/game.helper';
import { RoleId } from '../../src/enums/role-id';

test('should serialize correctly', () => {
  jest.useFakeTimers();

  const game = new Game();

  GameHelper.fillPlayers(game, 5);

  game.start();

  /////////////////////////////////////////////
  // Quest 1
  /////////////////////////////////////////////
  // round 1
  GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2']);
  jest.runAllTimers();

  GameHelper.voteAllForTeam(game, false);
  jest.runAllTimers();

  // round 2
  GameHelper.proposeAndSubmitTeam(game, ['user-3', 'user-4']);
  jest.runAllTimers();

  GameHelper.voteAllForTeam(game, true);
  jest.runAllTimers();

  // quest voting
  GameHelper.voteAllForQuest(game, true);
  jest.runAllTimers();

  /////////////////////////////////////////////
  // Quest 2
  /////////////////////////////////////////////
  GameHelper.proposeAndSubmitTeam(game, ['user-3', 'user-4', 'user-1']);
  jest.runAllTimers();

  GameHelper.voteAllForTeam(game, true);
  jest.runAllTimers();

  GameHelper.voteAllForQuest(game, false);
  jest.runAllTimers();

  /////////////////////////////////////////////
  // Quest 3
  /////////////////////////////////////////////

  GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-4']);
  jest.runAllTimers();

  GameHelper.voteAllForTeam(game, true);
  jest.runAllTimers();

  GameHelper.voteAllForQuest(game, false);
  jest.runAllTimers();

  /////////////////////////////////////////////
  // Quest 4
  /////////////////////////////////////////////
  GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-4', 'user-3']);
  jest.runAllTimers();

  GameHelper.voteAllForTeam(game, true);
  jest.runAllTimers();

  GameHelper.voteAllForQuest(game, true);
  jest.runAllTimers();

  /////////////////////////////////////////////
  // Quest 5
  /////////////////////////////////////////////
  GameHelper.proposeAndSubmitTeam(game, ['user-1', 'user-2', 'user-3']);
  jest.runAllTimers();

  GameHelper.voteAllForTeam(game, true);
  jest.runAllTimers();

  GameHelper.voteAllForQuest(game, false);
  jest.runAllTimers();

  const serialized = game.serialize('user-1');

  // meta data should be set
  expect(serialized.meta.createdAt).toBeTruthy();
  expect(serialized.meta.startedAt).toBeTruthy();
  expect(serialized.meta.finishedAt).toBeTruthy();
  expect(serialized.meta.creatorId).toEqual('user-0');
  expect(serialized.meta.status).toEqual('Lost');

  // every player should be revealed
  const unknownPlayers = serialized.players.collection.filter(
    (p) => p.role.id === RoleId.Unknown
  );

  expect(unknownPlayers.length).toStrictEqual(0);
});
