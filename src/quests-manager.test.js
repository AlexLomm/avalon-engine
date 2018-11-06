const _             = require('lodash');
const QuestsManager = require('./quests-manager');
const Quest         = require('./quest');
const LevelPreset   = require('./level-preset');
const Vote          = require('./vote');

describe('current quest', () => {
  let manager;
  let preset;

  beforeEach(() => {
    manager = new QuestsManager();
    preset  = new LevelPreset(5);
    manager.init(preset);
  });

  test('should get the first quest by default', () => {
    const quest1 = manager.getAll()[0];

    expect(quest1).toBe(manager.getCurrentQuest());
  });

  test('should make the next quest current', () => {
    manager.nextQuest();

    const quest2 = manager.getAll()[1];

    expect(quest2).toBe(manager.getCurrentQuest());
  });
});

test('should initialize quests', () => {
  const manager = new QuestsManager();

  expect(manager.getAll().length).toBeFalsy();

  manager.init(new LevelPreset(5));

  expect(manager.getAll().length).toEqual(5);
  expect(manager.getAll()[0] instanceof Quest).toBeTruthy();
});

test('should be able to add a vote', () => {
  const manager = new QuestsManager();
  manager.init(new LevelPreset(5));

  const currentQuest = manager.getCurrentQuest();
  jest.spyOn(currentQuest, 'addVote');

  manager.addVote(new Vote(1, true));

  expect(currentQuest.addVote).toBeCalledTimes(1);
});

test('should return whether the current team voting was successful or not', () => {
  const manager = new QuestsManager();
  const preset  = new LevelPreset(5);
  manager.init(preset);
  const quest = manager.getCurrentQuest();

  jest.spyOn(quest, 'teamVotingWasSuccessful');

  _.times(preset.getPlayerCount(), (i) => manager.addVote(new Vote(i, true)));

  expect(quest.teamVotingWasSuccessful())
    .toStrictEqual(manager.teamVotingWasSuccessful());
  expect(quest.teamVotingWasSuccessful).toBeCalled();
});

test('should return whether the team voting is over or not', () => {
  const manager = new QuestsManager();
  const preset  = new LevelPreset(5);
  manager.init(preset);
  const quest = manager.getCurrentQuest();

  jest.spyOn(quest, 'teamVotingRoundIsOver');

  _.times(preset.getPlayerCount(), (i) => manager.addVote(new Vote(i, false)));

  expect(quest.teamVotingRoundIsOver())
    .toStrictEqual(manager.teamVotingRoundIsOver());
  expect(quest.teamVotingRoundIsOver).toBeCalled();
});

test('should return whether it\'s the last round of team voting', () => {
  const manager = new QuestsManager();
  manager.init(new LevelPreset(5));
  const quest = manager.getCurrentQuest();

  jest.spyOn(quest, 'isLastRoundOfTeamVoting');

  expect(quest.isLastRoundOfTeamVoting())
    .toStrictEqual(manager.isLastRoundOfTeamVoting());
  expect(quest.isLastRoundOfTeamVoting).toBeCalled();
});
