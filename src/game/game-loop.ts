import { Io } from '../io/io';
import { examine } from './commands/examine';
import { hello } from './commands/hello';
import { help } from './commands/help';
import { look } from './commands/look';
import { use } from './commands/use';
import { move } from './items/hanoi';
import { inventory } from './items/pocket';
import { konamiCode, konami, iddqd } from './items/secrets';
import { lumos } from './items/sticks';
import { initialState, State } from './state';

export type CommandResult = string | [string | string[], Partial<State>];

export async function gameLoop(io: Io){
    let state = initialState;

    io.writeln(``);
    io.writeln(`<c>Adventure time!</c>`);
    io.writeln(`<c>https://github.com/encse/text-adventure</c>`);
    io.writeln(``);
    io.writeln(``);
    io.writeln(``);
    io.writeln(`- Ouch, that hurts! What's this <i>darkness</i>? Where is everyone?`);

    while(true) {
        let res = runCommand(await io.readln(), state);
        let msg = ''
        if (typeof(res) == 'string'){
            msg = res;
        } else {
            state = { ...state, ...res[1] };
            msg = Array.isArray(res[0]) ? res[0].filter(x => x !== '').join(' ') : res[0];
        }
        io.writeln(msg.trim());
    }
}

function runCommand(command: string, state: State): CommandResult {
    let verb = command.trim().split(' ')[0];
    let obj = command.trim().split(' ').slice(1).join(' ');

    if (verb === 'l') { verb = 'look'; }
    if (verb === 'h') { verb = 'help'; }
    if (verb === 'i') { verb = 'inventory'; }
    if (verb === 'inv') { verb = 'inventory'; }
    if (verb === 'e') { verb = 'examine'; }
    if (verb === 'u') { verb = 'use'; }
    if (verb === 'm') { verb = 'move'; }

    switch (verb) {
        case 'hello':
            return hello(state, obj);   
        case konamiCode:
            return konami(state, obj);
        case 'iddqd':
            return iddqd(state, obj);
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
    }
    return "I don't understand.";
}