import { VoteSerialized } from './types/vote-serialized';

export class Vote {
  private id: string;
  private value: boolean;

  constructor(id: string, value: boolean) {
    this.id    = id;
    this.value = value;
  }

  getId() {
    return this.id;
  }

  getValue() {
    return this.value;
  }

  serialize(): VoteSerialized {
    return {
      id: this.id,
      value: this.value,
    };
  }
}
