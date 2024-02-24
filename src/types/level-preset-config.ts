import { QuestConfig } from './quest-config';

export type LevelPresetConfig = {
  goodCount: number;
  evilCount: number;
  quests: [QuestConfig, QuestConfig, QuestConfig, QuestConfig, QuestConfig];
};
