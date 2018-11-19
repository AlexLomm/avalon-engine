export class Vote {
  private _username: string;
  private _value: boolean;

  constructor(username: string, value: boolean) {
    this._username = username;
    this._value    = value;
  }

  getUsername() {
    return this._username;
  }

  getValue() {
    return this._value;
  }

  serialize() {
    return {
      username: this._username,
      value: this._value,
    };
  }
}
