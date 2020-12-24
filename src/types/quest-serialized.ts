import { VoteSerialized } from './vote-serialized';

export type QuestSerialized = {
  status: string;
  failsNeededCount: number;
  votesNeededCount: number;
  teamVotes: VoteSerialized[];
  questVotes: VoteSerialized[];
};
