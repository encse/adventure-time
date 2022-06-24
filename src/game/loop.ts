import { Io } from '../io/io';
import { examine } from './commands/examine';
import { hello } from './commands/hello';
import { help } from './commands/help';
import { look } from './commands/look';
import { use } from './commands/use';
import { move } from './items/hanoi';
import { inventory } from './items/pocket';
import { konamiCode, konami, iddqd, xyzzy } from './items/secrets';
import { lumos } from './items/sticks';
import { initialState, State } from './state';

export async function gameLoop(io: Io) {
    let state = initialState;

    io.writeln(``);
    io.writeln(`<c>Adventure time!</c>`);
    io.writeln(`<c>https://github.com/encse/text-adventure</c>`);
    io.writeln(``);
    io.writeln(``);
    io.writeln(``);
    io.writeln(`- Ouch, that hurts! What's this <i>darkness</i>? Where is everyone?`);

    while (true) {
        let msg: string;
        [msg, state] = processInput(await io.readln(), state);

        if (msg !== '') {
            io.writeln(msg.trim());
            io.writeln('');
        }
    }
}

export function processInput(input: string, state: State): [string, State] {
    const res = execute(input, state);
    let msg = ''
    if (typeof (res) == 'string') {
        msg = res;
    } else {
        msg = res[0];
        state = { ...state, ...res[1] };
    }
    return [msg.trim(), state];
}

export type CommandResult = string | [string, Partial<State>];

function execute(input: string, state: State): CommandResult {
    if (input === konamiCode) {
        return konami(state, '');
    }

    const parts = input.trim().toLowerCase().split(' ');
    let [verb, obj] = [parts[0].trim(), parts.slice(1).join(' ').trim()];

    if (verb === 'l') { verb = 'look'; }
    if (verb === 'h') { verb = 'help'; }
    if (verb === 'i') { verb = 'inventory'; }
    if (verb === 'inv') { verb = 'inventory'; }
    if (verb === 'x') { verb = 'examine'; }
    if (verb === 'u') { verb = 'use'; }
    if (verb === 'm') { verb = 'move'; }

    switch (verb) {
        case '':
            return '';
        case 'hello':
            return hello(state, obj);
        case 'iddqd':
            return iddqd(state, obj);
        case 'xyzzy':
            return xyzzy(state, obj);
        case 'lumos':
            return lumos(state);
        case 'inventory':
            return inventory(state, obj);
        case 'help':
            return help(state, obj);
        case 'look':
            return look(state, obj);
        case 'examine':
            return examine(state, obj);
        case 'use':
            return use(state, obj);
        case 'move':
            return move(state, obj)
        default:
            return `I don't understand.`;
    }
}