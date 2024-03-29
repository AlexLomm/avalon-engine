import { LevelPresetSerialized } from './level-preset-serialized';

export type GameMetaDataSerialized = {
  id: string;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
  levelPreset: LevelPresetSerialized;
  status: string;
  creatorId: string;
};
