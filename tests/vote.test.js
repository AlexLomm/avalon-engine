const Vote = require('../src/vote');

test('should get vote', () => {
  const vote = new Vote('user-1', true);

  expect(vote.getUsername()).toEqual('user-1');
});

test('should get username', () => {
  const vote = new Vote('user-1', true);

  expect(vote.getValue()).toStrictEqual(true);
});

test('should serialize a revealed vote', () => {
  const vote = new Vote('some-user', false);

  const actual   = vote.serialize(true);
  const expected = {
    username: 'some-user',
    vote: false,
  };

  expect(actual).toEqual(expected);
});

test('should serialize a hidden vote', () => {
  const vote = new Vote('some-user', false);

  const actual   = vote.serialize(false);
  const expected = {
    username: 'some-user',
    vote: null,
  };

  expect(actual).toEqual(expected);
});
