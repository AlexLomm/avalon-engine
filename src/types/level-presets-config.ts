import { LevelPresetConfig } from './level-preset-config';
import { LevelPresetId } from './level-preset-id';

export type LevelPresetsConfig = {
  [key in LevelPresetId]: LevelPresetConfig;
}
