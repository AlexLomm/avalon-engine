import { VoteSerialized } from './types/vote-serialized';

export class Vote {
  private username: string;
  private value: boolean;

  constructor(username: string, value: boolean) {
    this.username = username;
    this.value    = value;
  }

  getUsername() {
    return this.username;
  }

  getValue() {
    return this.value;
  }

  serialize(): VoteSerialized {
    return {
      username: this.username,
      value: this.value,
    };
  }
}
