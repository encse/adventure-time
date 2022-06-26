import c from 'ansi-colors';
import {processInput} from './game/loop';
import {initialState, State} from './game/state';
import {konamiCode} from './game/items/secrets';

c.enabled = false;

test('Can play the game', () => {
    let state = initialState;
    state = step(state, 'help', ['look', 'examine', 'use']);
    state = step(state, 'lumos', 'You don\'t have a magic wand.');
    state = step(state, 'examine box of matches', 'Kick Stand bar');
    state = step(state, 'hello', 'Is it a good idea to start making noise in a dark room?');
    state = step(state, 'examine darkness', 'You wish you had a brass lantern.');
    state = step(state, 'use darkness', 'I am your father');
    state = step(state, 'iddqd', 'You have found a secret');
    state = step(state, konamiCode, 'You have found a secret');
    state = step(state, 'look', 'box of matches');
    state = step(state, 'use matches', 'weird installation');
    state = step(state, 'examine installation', ['small', 'medium', 'large disk']);
    state = step(state, 'move small disk to center', 'The disk starts glowing in red, illuminating the room.');
    state = step(state, 'look around', 'wall');
    state = step(state, 'look at the wall', 'The wall is painted to black');
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

test('Light works', () => {
    let state = initialState;
    step(state, 'light a match', 'Fwoosh...');
    step(state, 'light the match', 'Fwoosh...');
    step(state, 'light a matches', 'Fwoosh...');
    step(state, 'light the matches', 'Fwoosh...');
    step(state, 'light a box of matches', 'Fwoosh...');
    step(state, 'light the box of matches', 'Fwoosh...');

    step(state, 'light the darkness', `That's not the best idea.`);
    step(state, 'light the room', `That's not the best idea.`);

    state = step(state, 'light a box of matches', 'Fwoosh...');
    step(state, 'light the darkness', 'You have ran out of matches.');
    step(state, 'light the room', 'You have ran out of matches.');
});

test('Look works', () => {
    const state:State = {
        ...initialState,
        smallDisk: {...initialState.smallDisk, location: 'center stick'},
    };

    step(state, 'look', 'The dim light of the installation fills the room with red colors.');
    step(state, 'look around', 'The dim light of the installation fills the room with red colors.');

    step(state, 'look wall', 'The wall is painted to black');
    step(state, 'look at wall', 'The wall is painted to black');
    step(state, 'look at a wall', 'The wall is painted to black');
    step(state, 'look at the wall', 'The wall is painted to black');
});


function step(state: State, input: string, expected: string | string[]): State {
    let msg: string;
    [msg, state] = processInput(input, state);
    if (!Array.isArray(expected)) {
        expected = [expected];
    }
    for (const phrase of expected) {
        expect(msg).toContain(phrase);
    }
    return state;
}
