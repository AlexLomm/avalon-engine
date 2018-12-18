import { Vote } from '../../src/vote';
import { VoteSerialized } from '../../src/types/vote-serialized';

test('should get vote', () => {
  const vote = new Vote('user-1', true);

  expect(vote.getId()).toEqual('user-1');
});

test('should get id', () => {
  const vote = new Vote('user-1', true);

  expect(vote.getValue()).toStrictEqual(true);
});

test('should serialize', () => {
  const vote = new Vote('some-user', false);

  const actual = vote.serialize();

  const expected: VoteSerialized = {
    id: 'some-user',
    value: false,
  };

  expect(actual).toEqual(expected);
});
