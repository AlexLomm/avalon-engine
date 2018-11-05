const _             = require('lodash');
const QuestsManager = require('./quests-manager');
const Quest         = require('./quest');
const LevelPreset   = require('./level-preset');
const Vote          = require('./vote');

test('should initialize quests', () => {
  const manager = new QuestsManager();

  expect(manager.getAll().length).toBeFalsy();

  manager.init(new LevelPreset(5));

  expect(manager.getAll().length).toEqual(5);
  expect(manager.getAll()[0] instanceof Quest).toBeTruthy();
});

test('should get the current quest', () => {
  const manager = new QuestsManager();
  const preset  = new LevelPreset(5);
  manager.init(preset);

  expect(manager.getCurrentQuest()).toBeTruthy();

  const quest1 = manager.getAll()[0];
  const quest2 = manager.getAll()[1];

  expect(manager.getCurrentQuest()).toBe(quest1);

  _.times(preset.getPlayerCount(), (i) => quest1.addVote(new Vote(i, true)));

  expect(manager.getCurrentQuest()).toBe(quest1);

  _.times(preset.getQuests()[0].votesNeeded, (i) => quest1.addVote(new Vote(i, true)));

  expect(manager.getCurrentQuest()).toBe(quest2);
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

  expect(manager.teamVotingWasSuccessful())
    .toStrictEqual(quest.teamVotingWasSuccessful());

  _.times(preset.getPlayerCount(), (i) => manager.addVote(new Vote(i, true)));

  expect(manager.teamVotingWasSuccessful())
    .toStrictEqual(quest.teamVotingWasSuccessful());
});

test('should return whether the team voting is over or not', () => {
  const manager = new QuestsManager();
  const preset  = new LevelPreset(5);
  manager.init(preset);

  const quest = manager.getCurrentQuest();

  expect(manager.teamVotingRoundIsOver())
    .toStrictEqual(quest.teamVotingRoundIsOver());

  _.times(preset.getPlayerCount(), (i) => manager.addVote(new Vote(i, false)));

  expect(manager.teamVotingRoundIsOver())
    .toStrictEqual(quest.teamVotingRoundIsOver());
});
