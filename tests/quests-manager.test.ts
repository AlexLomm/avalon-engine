import * as _ from 'lodash';
import { Vote } from '../src/vote';
import { QuestsManager, GameStatus, AssassinationStatus } from '../src/quests-manager';
import { Quest } from '../src/quest';
import { LevelPreset } from '../src/level-preset';

const resolveQuestsTimes = function (manager: QuestsManager, voteValue: boolean, times: number) {
  _.times(times, () => {
    // approve the team
    _.times(manager.getLevelPreset().getPlayerCount(), (i: number) => {
      manager.addVote(new Vote(`user-${i}`, true));
    });

    // fail or succeed a quest (depends on `vote`)
    _.times(manager.getCurrentQuest().getVotesNeeded(), (i) => {
      manager.addVote(new Vote(`user-${i}`, voteValue));
    });

    manager.nextQuest();
  });
};

const failQuestsTimes = function (manager: QuestsManager, times: number) {
  resolveQuestsTimes(manager, false, times);
};

const succeedQuestsTimes = function (manager: QuestsManager, times: number) {
  resolveQuestsTimes(manager, true, times);
};

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

describe('assassination', () => {
  let manager: QuestsManager;
  let preset: LevelPreset;
  beforeEach(() => {
    manager = new QuestsManager();
    preset  = new LevelPreset(5);

    manager.init(preset);
  });

  test('should return that assassination is allowed after three successful quests', () => {
    expect(manager.assassinationAllowed()).toBeFalsy();

    succeedQuestsTimes(manager, 3);

    expect(manager.assassinationAllowed()).toBeTruthy();
  });

  test('should return that assassination is not allowed if one has already occurred', () => {
    succeedQuestsTimes(manager, 3);

    manager.setAssassinationStatus(true);

    expect(manager.assassinationAllowed()).toBeFalsy();
  });

  test('should not allow assassination if the team "evil" has already won', () => {
    failQuestsTimes(manager, 3);

    expect(manager.assassinationAllowed()).toBeFalsy();
  });
});

describe('winner', () => {
  let manager: QuestsManager;
  let preset: LevelPreset;
  let currentQuest: Quest;
  beforeEach(() => {
    manager = new QuestsManager();
    preset  = new LevelPreset(5);

    manager.init(preset);

    currentQuest = manager.getCurrentQuest();
  });

  test('should return status: "-1" if there are no three failed or won quests', () => {
    expect(manager.getGameStatus()).toEqual(GameStatus.Unfinished);
  });

  test('should return status: "0" if there are three failed quests', () => {
    failQuestsTimes(manager, 3);

    expect(manager.getGameStatus()).toStrictEqual(GameStatus.Lost);
  });

  test('should return status: "0" if the assassination succeeded', () => {
    succeedQuestsTimes(manager, 3);

    manager.setAssassinationStatus(true);

    expect(manager.getGameStatus()).toStrictEqual(GameStatus.Lost);
  });

  test('should return status: "1" if the assassination failed', () => {
    succeedQuestsTimes(manager, 3);

    manager.setAssassinationStatus(false);

    expect(manager.getGameStatus()).toStrictEqual(GameStatus.Won);
  });

  test('should not return status "1" if the assassination has not been attempted yet', () => {
    succeedQuestsTimes(manager, 3);

    expect(manager.getGameStatus()).toStrictEqual(GameStatus.Unfinished);
  });
});

describe('serialization', () => {
  test('should return an empty state', () => {
    const manager = new QuestsManager();

    // TODO: add type
    const expected: any = {
      collection: [],
      teamVotingRoundIndex: 0,
      assassinationStatus: AssassinationStatus.Unattempted,
    };

    const actual = manager.serialize(false);

    expect(expected).toEqual(actual);
  });

  test('should contain serialized quests', () => {
    const manager = new QuestsManager();
    manager.init(new LevelPreset(5));

    const serializedQuest = manager.getAll()[0].serialize(false);

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

  test('should serialize the quests with an appropriate flag set', () => {
    const manager = new QuestsManager();
    manager.init(new LevelPreset(5));

    const quest = manager.getAll()[0];
    jest.spyOn(quest, 'serialize');

    manager.serialize(true);

    expect(quest.serialize).toBeCalledWith(true);
  });
});
