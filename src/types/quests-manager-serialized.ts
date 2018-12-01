import { QuestSerialized } from './quest-serialized';

export type QuestsManagerSerialized = {
  collection: QuestSerialized[];
  teamVotingRoundIndex: number;
}
