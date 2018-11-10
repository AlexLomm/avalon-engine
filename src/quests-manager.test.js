const _             = require('lodash');
const errors        = require('./errors');
const QuestsManager = require('./quests-manager');
const Quest         = require('./quest');
const LevelPreset   = require('./level-preset');
const Vote          = require('./vote');

const resolveQuestsTimes = function (manager, vote, times) {
  _.times(times, () => {
    // approve the team
    _.times(manager.getLevelPreset().getPlayerCount(), (i) => {
      manager.addVote(new Vote(`user-${i}`, true));
    });

    // fail or succeed a quest (depends on `vote`)
    _.times(manager.getCurrentQuest().getVotesNeeded(), (i) => {
      manager.addVote(new Vote(`user-${i}`, vote));
    });

    manager.nextQuest();
  });
};

const failQuestsTimes = function (manager, times) {
  resolveQuestsTimes(manager, false, times);
};

const succeedQuestsTimes = function (manager, times) {
  resolveQuestsTimes(manager, true, times);
};

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

describe('team voting', () => {
  let manager;
  let preset;
  let currentQuest;
  beforeEach(() => {
    manager = new QuestsManager();
    preset  = new LevelPreset(5);

    manager.init(preset);

    currentQuest = manager.getCurrentQuest();
  });

  test('should be able to add a vote', () => {
    jest.spyOn(currentQuest, 'addVote');

    manager.addVote(new Vote(1, true));

    expect(currentQuest.addVote).toBeCalledTimes(1);
  });

  test('should return whether the current team voting was successful or not', () => {
    jest.spyOn(currentQuest, 'teamVotingSucceeded');

    _.times(preset.getPlayerCount(), (i) => manager.addVote(new Vote(i, true)));

    expect(currentQuest.teamVotingSucceeded())
      .toStrictEqual(manager.teamVotingSucceeded());

    expect(currentQuest.teamVotingSucceeded).toBeCalled();
  });

  test('should return whether the team voting is over or not', () => {
    jest.spyOn(currentQuest, 'teamVotingRoundFinished');

    _.times(preset.getPlayerCount(), (i) => manager.addVote(new Vote(i, false)));

    expect(currentQuest.teamVotingRoundFinished())
      .toStrictEqual(manager.teamVotingRoundFinished());

    expect(currentQuest.teamVotingRoundFinished).toBeCalled();
  });

  test('should return whether it\'s the last round of team voting', () => {
    jest.spyOn(currentQuest, 'isLastRoundOfTeamVoting');

    expect(currentQuest.isLastRoundOfTeamVoting())
      .toStrictEqual(manager.isLastRoundOfTeamVoting());

    expect(currentQuest.isLastRoundOfTeamVoting).toBeCalled();
  });
});

describe('assassination', () => {
  let manager;
  let preset;
  beforeEach(() => {
    manager = new QuestsManager();
    preset  = new LevelPreset(5);

    manager.init(preset);
  });

  test('should return that assassination is allowed after three successful quests', () => {
    expect(manager.assassinationIsAllowed()).toBeFalsy();

    succeedQuestsTimes(manager, 3);

    expect(manager.assassinationIsAllowed()).toBeTruthy();
  });

  test('should return that assassination is not allowed if one has already occurred', () => {
    succeedQuestsTimes(manager, 3);

    manager.setAssassinationStatus(true);

    expect(manager.assassinationIsAllowed()).toBeFalsy();
  });

  test('should not allow assassination if the team "evil" has already won', () => {
    failQuestsTimes(manager, 3);

    expect(manager.assassinationIsAllowed()).toBeFalsy();
  });

  test('should not allow assassination attempt to resolve too early', () => {
    expect(() => manager.setAssassinationStatus(false))
      .toThrow(errors.NO_ASSASSINATION_TIME);

    expect(() => manager.setAssassinationStatus(true))
      .toThrow(errors.NO_ASSASSINATION_TIME);
  });
});

describe('winner', () => {
  let manager;
  let preset;
  let currentQuest;
  beforeEach(() => {
    manager = new QuestsManager();
    preset  = new LevelPreset(5);

    manager.init(preset);

    currentQuest = manager.getCurrentQuest();
  });

  test('should return status: "-1" if there are no three failed or won quests', () => {
    expect(manager.getStatus()).toEqual(-1);
  });

  test('should return status: "0" if there are three failed quests', () => {
    failQuestsTimes(manager, 3);

    expect(manager.getStatus()).toStrictEqual(0);
  });

  test('should return status: "0" if the assassination succeeded', () => {
    succeedQuestsTimes(manager, 3);

    manager.setAssassinationStatus(true);

    expect(manager.getStatus()).toStrictEqual(0);
  });

  test('should return status: "1" if the assassination failed', () => {
    succeedQuestsTimes(manager, 3);

    manager.setAssassinationStatus(false);

    expect(manager.getStatus()).toStrictEqual(1);
  });

  test('should not return status "1" if the assassination has not been attempted yet', () => {
    succeedQuestsTimes(manager, 3);

    expect(manager.getStatus()).toStrictEqual(-1);
  });
});

test('should initialize quests', () => {
  const manager = new QuestsManager();

  expect(manager.getAll().length).toBeFalsy();

  manager.init(new LevelPreset(5));

  expect(manager.getAll().length).toEqual(5);
  expect(manager.getAll()[0] instanceof Quest).toBeTruthy();
});

test('should get level preset', () => {
  const manager = new QuestsManager();

  expect(manager.getLevelPreset()).toBeFalsy();

  const preset = new LevelPreset(5);
  manager.init(preset);

  expect(manager.getLevelPreset()).toBe(preset);
});
