import { QuestSerialized } from './quest-serialized';

export type QuestsManagerSerialized = {
  collection: QuestSerialized[];
  currentQuestIndex: number;
  teamVotingRoundIndex: number;
};
