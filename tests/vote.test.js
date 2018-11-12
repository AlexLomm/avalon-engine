const Vote = require('../src/vote');

test('should get vote', () => {
  const vote = new Vote('user-1', true);

  expect(vote.getUsername()).toEqual('user-1');
});

test('should get username', () => {
  const vote = new Vote('user-1', true);

  expect(vote.getValue()).toStrictEqual(true);
});
