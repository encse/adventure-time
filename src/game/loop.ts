import {Io} from '../io/io';
import {examine} from './commands/examine';
import {dontUnderstand} from './commands/feedback';
import {hello} from './commands/hello';
import {help} from './commands/help';
import {look} from './commands/look';
import {use} from './commands/use';
import {light} from './items/box-o-match';
import {move} from './items/hanoi';
import {inventory} from './items/pocket';
import {konamiCode, konami, iddqd, xyzzy} from './items/secrets';
import {lumos} from './items/sticks';
import {initialState, State} from './state';

export async function gameLoop(io: Io) {
    let state = initialState;

    io.writeln(``);
    io.writeln(`<c>Adventure time!</c>`);
    io.writeln(`<c>https://github.com/encse/adventure-time</c>`);
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
    let msg = '';
    if (typeof (res) == 'string') {
        msg = res;
    } else {
        msg = res[0];
        state = {...state, ...res[1]};
    }
    return [msg.trim(), state];
}

export type CommandResult = string | [string, Partial<State>];

function execute(input: string, state: State): CommandResult {
    if (input === konamiCode) {
        return konami(state, '');
    }

    const parts = input.trim().toLowerCase().split(' ');
    const [verb, obj] = [parts[0].trim(), parts.slice(1).join(' ').trim()];

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
    case 'i':
    case 'inv':
    case 'inventory':
        return inventory(state, obj);
    case 'h':
    case 'help':
        return help(state, obj);
    case 'l':
    case 'look':
        return look(state, skip('at', obj));
    case 'x':
    case 'examine':
    case 'inspect':
    case 'investigate':
        return examine(state, obj);
    case 'u':
    case 'use':
        return use(state, obj);
    case 'm':
    case 'move':
        return move(state, obj);
    case 'light':
        return light(state, obj);
    default:
        return dontUnderstand(state, input);
    }
}

export function skip(prefix: string|string[], input: string) {
    if (!Array.isArray(prefix)) {
        prefix = [prefix];
    }

    const parts = input.trim().toLowerCase().split(' ');
    if (prefix.includes(parts[0])) {
        return parts.slice(1).join(' ').trim();
    }
    return input;
}

export function skipArticles(input: string) {
    return skip(['a', 'an', 'the'], input);
}
