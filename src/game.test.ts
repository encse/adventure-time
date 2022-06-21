import { processInput } from './game/loop';
import { initialState, State } from './game/state';
import c from 'ansi-colors';
import { konamiCode } from './game/items/secrets';

test('Can play the game', () => {
    c.enabled = false;

    let state = initialState;
    state = step(state, 'help', ["Look", "examine", "use"]);
    state = step(state, 'lumos', "You don't have a magic wand.");
    state = step(state, 'examine box of matches', 'Kickstand bar');
    state = step(state, 'hello', 'Is it a good idea to start making noise in a dark room?');
    state = step(state, 'examine darkness', 'You wish you had a brass lantern.');
    state = step(state, 'use darkness', 'I am your father');
    state = step(state, 'iddqd', 'You have found a secret');
    state = step(state, konamiCode, 'You have found a secret');
    state = step(state, 'look', 'box of matches');
    state = step(state, 'use matches', 'weird installation');
    state = step(state, 'use matches', 'ran out of matches');
    state = step(state, 'examine installation', ["small", "medium", "large disk"]);
    state = step(state, 'move small disk to center', 'The disk starts glowing in red, illuminating the room.');
    state = step(state, 'look', 'wall');
    state = step(state, 'look wall', 'Somebody painted');
    state = step(state, 'use stick from the floor', 'twist the stick into the hole');
    state = step(state, 'move large disk to the center', 'The disks are heavy');
    state = step(state, 'move medium disk to the right', 'carefully lift');
    state = step(state, 'move medium disk to the right', 'already there');
    state = step(state, 'move large disk to the right', 'You are not a Feng shui expert');
    state = step(state, 'move small disk to the right', 'carefully lift');
    state = step(state, 'move large disk to the middle', 'carefully lift');
    state = step(state, 'move small disk to the left stick', 'carefully lift');
    state = step(state, 'move medium disk to the center stick', 'carefully lift');
    state = step(state, 'move small disk to the center stick', 'carefully lift');
    step(state, 'look wall', 'manage to decipher this message');
});

function step(state: State, input: string, expected: string|string[]): State {
    let msg: string;
    [msg, state] = processInput(input, state);
    if (!Array.isArray(expected)){
        expected = [expected];
    }
    for (let phrase of expected){
        expect(msg).toContain(phrase);
    }
    return state;
}