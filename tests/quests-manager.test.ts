import * as _ from 'lodash';
import { Vote } from '../src/vote';
import { QuestsManager, QuestsManagerSerialized } from '../src/quests-manager';
import { Quest } from '../src/quest';
import { LevelPreset } from '../src/level-preset';

function resolveQuestsTimes(manager: QuestsManager, voteValue: boolean, times: number) {
  _.times(times, () => {
    // approve the team
    _.times(manager.getLevelPreset().getPlayerCount(), (i: number) => {
      manager.addVote(new Vote(`user-${i}`, true));
    });

    // fail or succeed a quest (depends on `vote`)
    _.times(manager.getCurrentQuest().getVotesNeededCount(), (i) => {
      manager.addVote(new Vote(`user-${i}`, voteValue));
    });

    manager.nextQuest();
  });
}

function failQuestsTimes(manager: QuestsManager, times: number) {
  resolveQuestsTimes(manager, false, times);
}

function succeedQuestsTimes(manager: QuestsManager, times: number) {
  resolveQuestsTimes(manager, true, times);
}

describe('initialization', () => {
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
});

describe('current quest', () => {
  let manager: QuestsManager;
  let preset: LevelPreset;
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
  let manager: QuestsManager;
  let preset: LevelPreset;
  let currentQuest: Quest;
  beforeEach(() => {
    manager = new QuestsManager();
    preset  = new LevelPreset(5);

    manager.init(preset);

    currentQuest = manager.getCurrentQuest();
  });

  test('should be able to add a vote', () => {
    jest.spyOn(currentQuest, 'addVote');

    manager.addVote(new Vote('user-1', true));

    expect(currentQuest.addVote).toBeCalledTimes(1);
  });

  test('should return whether the current team voting was successful or not', () => {
    jest.spyOn(currentQuest, 'teamVotingSucceeded');

    _.times(preset.getPlayerCount(), (i) => manager.addVote(new Vote(`user-${i}`, true)));

    expect(currentQuest.teamVotingSucceeded())
      .toStrictEqual(manager.teamVotingSucceeded());

    expect(currentQuest.teamVotingSucceeded).toBeCalled();
  });

  test('should return whether the team voting is over or not', () => {
    jest.spyOn(currentQuest, 'teamVotingRoundFinished');

    _.times(preset.getPlayerCount(), (i) => manager.addVote(new Vote(`user-${i}`, false)));

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

describe('serialization', () => {
  test('should return an empty state', () => {
    const manager = new QuestsManager();

    const expected: QuestsManagerSerialized = {
      collection: [],
      teamVotingRoundIndex: 0,
    };

    const actual = manager.serialize(false);

    expect(expected).toEqual(actual);
  });

  test('should contain serialized quests', () => {
    const manager = new QuestsManager();
    manager.init(new LevelPreset(5));

    const serializedQuest = manager.getAll()[0].serialize(false,false);

    expect(manager.serialize(false).collection[0]).toEqual(serializedQuest);
  });

  test('should contain a team voting round tracker', () => {
    const manager = new QuestsManager();
    const preset  = new LevelPreset(5);
    manager.init(preset);

    const currentQuest = manager.getCurrentQuest();
    _.times(preset.getPlayerCount(), (i: number) => {
      currentQuest.addVote(new Vote(`user-${i}`, false));
    });

    expect(manager.serialize(false).teamVotingRoundIndex)
      .toEqual(currentQuest.getTeamVotingRoundIndex());
  });

  test('should reveal votes only for the current quest', () => {
    const manager = new QuestsManager();
    manager.init(new LevelPreset(5));

    _.times(5, (i) => manager.addVote(new Vote(`user-${i}`, true)));
    _.times(2, (i) => manager.addVote(new Vote(`user-${i}`, true)));

    const beforeNextQuest = manager.serialize(false);
    expect(beforeNextQuest.collection[0].teamVotes.length).toBeTruthy();
    expect(beforeNextQuest.collection[0].questVotes.length).toBeTruthy();

    manager.nextQuest();

    const afterNextQuest = manager.serialize(false);
    expect(afterNextQuest.collection[0].teamVotes.length).toBeFalsy();
    expect(afterNextQuest.collection[0].questVotes.length).toBeFalsy();
  });
});

test('should get the amount of failed quests', () => {
  const manager = new QuestsManager();
  manager.init(new LevelPreset(7));

  succeedQuestsTimes(manager, 2);

  failQuestsTimes(manager, 3);

  expect(manager.getFailedQuestsCount()).toEqual(3);
});

test('should get the amount of succeeded quests', () => {
  const manager = new QuestsManager();
  manager.init(new LevelPreset(7));

  failQuestsTimes(manager, 1);

  succeedQuestsTimes(manager, 2);

  expect(manager.getSucceededQuestsCount()).toEqual(2);
});
