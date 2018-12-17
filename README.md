# Avalon Engine

This is an engine for playing the popular board game - "The Resistance: Avalon".

The library can be interacted with via the [GameClient](https://alexlomm.github.io/avalon-engine/classes/_game_client_.gameclient.html) class.

Please see the instructions below.

### Installation
```sh
npm i avalon-engine
```

### Usage

Initialize the game:

```javascript
const { GameClient, GameEvent, RoleId } = require('avalon-engine');

// Instantiate a new game object with an optional config.
const game = new GameClient({
  afterTeamProposition: 5000,
  afterTeamVoting: 7500,
  afterQuestVoting: 7500,
});
```

Add / remove event listeners:

```javascript
const onGameStateChange = () => console.log('State Changed!');

// Registers an event listener.
game.on(GameEvent.StateChange, onGameStateChange);

// Removes an event listener.
game.off(GameEvent.StateChange, onGameStateChange)
```

Get the game ID:

```javascript
// Returns a unique id for the game.
game.getId();
```

Add players to the game:

```javascript
// Adds the player with the `id-1` to the game. Adding players
// to the game is only allowed before the game is started.
game.addPlayer('id-1');
```

Remove players from the game:

```javascript
// Removes the player with the `id-1` from the game. Player 
// removal is only allowed before the game is started.
game.removePlayer('id-1');
```

Start the game:

```javascript
// Requires minim 5 and maximum 10 players to start the game. 
// Optionally, desired roles can be passed to the `start` 
// method (Assassin and Merlin will always be present even
// if not passed in explicitly).
game.start([RoleId.Morgana, RoleId.Percival]);
```

Propose a player for the team:

```javascript
// Only the leader is allowed to propose a player.
const leaderId = 'id-1';

// Any player can be proposed for the team.
const anyPlayerId = 'id-5';

// Proposes a player to be included in the team. 
game.toggleTeammateProposition(leaderId, anyPlayerId);
```

Reset proposed teammates:

```javascript
// Only the leader is allowed to reset the propositions.
const leaderId = 'id-1';

// "Un-proposes" every player
game.resetProposedTeammates(leaderId);
```

Finalize the proposed players as a team:

```javascript
// Only the leader is allowed to submit the team.
const leaderId = 'id-1';

// Finalizes the team members. The game then: 
//   - transitions to the "Frozen State" (Read-only mode)
//   - after the timeout (specified above), depending on whether the past 4 
//   team propositions have been rejected or not:
//     - transitions to the team voting phase, or
//     - bypasses the team voting phase, transitioning straight to the
//     quest voting phase.
game.submitTeam(leaderId);
```

Vote for the proposed team:

```javascript
// Any player can either approve or reject the proposed team.
const anyPlayerId = 'id-3';

// After the voting concludes, the game will:
//   - transition to the "Frozen State"
//   - after the timeout (specified above), depending on the 
//   results, the game will transition to either the quest voting 
//   or the team proposition state. 
game.voteForTeam(anyPlayerId, true);
```

Vote for the current quest:

```javascript
// Only the *proposed players* are allowed to cast either a positive
// or a negative vote.
const proposedPlayerId = 'id-3';

// Can only be called during the "quest voting" phase. If there are
// enough `fail` votes - the quest fails, otherwise - it succeeds. 
// Depending on the circumstances, from this point the game continues 
// following one of these scenarios:
//   - the game is over, bad guys win.
//   - the game transitions into the "Frozen State":
//     - after the timeout it returns to the team proposition state.
//     - after the timeout it proceeds to the assassination phase.
game.voteForQuest(proposedPlayerId, true);
```

Toggle victim proposition:

```javascript
// Only the assassin is allowed to propose a victim.
const assassinId = 'id-2';

// Anyone other than the Assassin can be proposed as a victim.
const victimId   = 'id-4';

// Toggles whether the player under `victimId` is proposed
// for assassination.
game.toggleVictimProposition(assassinId, victimId);
```

Assassinate the victim:

```javascript
// Only the assassin is allowed to assassinate the victim.
const assassinId = 'id-2';

// Finalizes the choice and assassinates the victim. If the victim
// turns out to be Merlin - the bad guys win, however, if the
// Assassin fails to guess who the Merlin is - the good guys win.
game.assassinate(assassinId);
```

Game serialization:

```javascript
const playerId = 'id-1';

// Serializes the game state from the perspective of a given player.
// E.g reveals bad guys to other bad guys, but hides them from the good
// guys, etc..
game.serialize(playerId);
```

---

The entire documentation can be viewed [here](https://alexlomm.github.io/avalon-engine/).
