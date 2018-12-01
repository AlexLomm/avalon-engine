import { PlayerSerialized } from './player-serialized';

export type PlayersManagerSerialized = {
  collection: PlayerSerialized[];
  proposedPlayerUsernames: string[];
  leader: string;
  isSubmitted: boolean;
  victim: string;
}
