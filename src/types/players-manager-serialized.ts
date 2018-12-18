import { PlayerSerialized } from './player-serialized';

export type PlayersManagerSerialized = {
  collection: PlayerSerialized[];
  proposedPlayerIds: string[];
  leaderId: string;
  isSubmitted: boolean;
  victimId: string;
}
