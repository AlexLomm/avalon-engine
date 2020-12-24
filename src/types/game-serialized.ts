import { GameMetaDataSerialized } from './game-meta-data-serialized';
import { PlayersManagerSerialized } from './players-manager-serialized';
import { QuestsManagerSerialized } from './quests-manager-serialized';

export type GameSerialized = {
  meta: GameMetaDataSerialized;
  players: PlayersManagerSerialized;
  quests: QuestsManagerSerialized;
};
