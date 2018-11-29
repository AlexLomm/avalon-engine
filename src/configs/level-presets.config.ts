export interface LevelPresetConfigs {
  [key: number]: LevelPresetConfig;
}

export interface LevelPresetConfig {
  goodCount: number;
  evilCount: number;
  quests: QuestConfig[];
}

export interface QuestConfig {
  votesNeededCount: number;
  failsNeededCount: number;
}

export const levelPresets: LevelPresetConfigs = {
  '-1': {
    goodCount: null,
    evilCount: null,
    quests: [],
  },
  5: {
    goodCount: 3,
    evilCount: 2,
    quests: [
      {votesNeededCount: 2, failsNeededCount: 1},
      {votesNeededCount: 3, failsNeededCount: 1},
      {votesNeededCount: 2, failsNeededCount: 1},
      {votesNeededCount: 3, failsNeededCount: 1},
      {votesNeededCount: 3, failsNeededCount: 1},
    ],
  },
  6: {
    goodCount: 4,
    evilCount: 2,
    quests: [
      {votesNeededCount: 2, failsNeededCount: 1},
      {votesNeededCount: 3, failsNeededCount: 1},
      {votesNeededCount: 4, failsNeededCount: 1},
      {votesNeededCount: 3, failsNeededCount: 1},
      {votesNeededCount: 4, failsNeededCount: 1},
    ],
  },
  7: {
    goodCount: 4,
    evilCount: 3,
    quests: [
      {votesNeededCount: 2, failsNeededCount: 1},
      {votesNeededCount: 3, failsNeededCount: 1},
      {votesNeededCount: 3, failsNeededCount: 1},
      {votesNeededCount: 4, failsNeededCount: 2},
      {votesNeededCount: 4, failsNeededCount: 1},
    ],
  },
  8: {
    goodCount: 5,
    evilCount: 3,
    quests: [
      {votesNeededCount: 3, failsNeededCount: 1},
      {votesNeededCount: 4, failsNeededCount: 1},
      {votesNeededCount: 4, failsNeededCount: 1},
      {votesNeededCount: 5, failsNeededCount: 2},
      {votesNeededCount: 5, failsNeededCount: 1},
    ],
  },
  9: {
    goodCount: 6,
    evilCount: 3,
    quests: [
      {votesNeededCount: 3, failsNeededCount: 1},
      {votesNeededCount: 4, failsNeededCount: 1},
      {votesNeededCount: 4, failsNeededCount: 1},
      {votesNeededCount: 5, failsNeededCount: 2},
      {votesNeededCount: 5, failsNeededCount: 1},
    ],
  },
  10: {
    goodCount: 6,
    evilCount: 4,
    quests: [
      {votesNeededCount: 3, failsNeededCount: 1},
      {votesNeededCount: 4, failsNeededCount: 1},
      {votesNeededCount: 4, failsNeededCount: 1},
      {votesNeededCount: 5, failsNeededCount: 2},
      {votesNeededCount: 5, failsNeededCount: 1},
    ],
  },
};
