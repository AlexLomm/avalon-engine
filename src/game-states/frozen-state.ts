import { BaseState } from './base-state';

export class FrozenState extends BaseState {
  protected resultsConcealed = false;
  protected rolesConcealed = true;
}
