import {State, Result} from './defs'
import {room} from './items/room';
import { wall } from './items/wall';
import { pocket, inventory } from './items/pocket';
import { smallDisk, mediumDisk, largeDisk } from './items/disk';
import { darkness } from './items/darkness';
import { matches } from './items/box-o-match';
import { installation, move } from './items/hanoi';
import { centerStick, leftStick, missingStick, lumos } from './items/sticks';
import { hole } from './items/hole';
import { hello } from './commands/hello';
import { examine } from './commands/examine';
import { look } from './commands/look';
import { help } from './commands/help';
import { use } from './commands/use';
import { iddqd, konami, konamiCode, secrets } from './items/secrets';
import { Io } from '../io/io';

export async function gameLoop(io: Io){
    let state: State = {
        installation,
        hole,
        leftStick,
        centerStick,
        missingStick,
        matches,
        darkness,
        room,
        smallDisk,
        mediumDisk,
        largeDisk,
        wall,
        pocket,
        secrets,
    };

    io.writeln(``);
    io.writeln(`<c>Adventure time!</c>`);
    io.writeln(`<c>https://github.com/encse/text-adventure</c>`);
    io.writeln(``);
    io.writeln(``);
    io.writeln(``);
    io.writeln(`- Ouch, that hurts! What's this <i>darkness</i>? Where is everyone?`);

    while(true) {
        let res = step(await io.readln(), state);
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

function step(st: string, state: State): Result {
    let command = st.trim().split(' ')[0];
    let obj = st.trim().split(' ').slice(1).join(' ');

    if (command === 'l') { command = 'look'; }
    if (command === 'h') { command = 'help'; }
    if (command === 'i') { command = 'inventory'; }
    if (command === 'inv') { command = 'inventory'; }
    if (command === 'e') { command = 'examine'; }
    if (command === 'u') { command = 'use'; }
    if (command === 'm') { command = 'move'; }

    switch (command) {
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