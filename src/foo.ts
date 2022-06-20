import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { center, highlight, lineBreak } from './textUtils';
import {State, Result} from './game-defs'
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

function step(st: string, state: State): Result {
    let verb = st.trim().split(' ')[0];
    let obj = st.trim().split(' ').slice(1).join(' ');

    if (verb === 'l') {  verb = 'look'; }
    if (verb === 'h') {  verb = 'help'; }
    if (verb === 'i') {  verb = 'inventory'; }
    if (verb === 'inv') {  verb = 'inventory'; }
    if (verb === 'e') {  verb = 'examine'; }
    if (verb === 'u') {  verb = 'use'; }
    if (verb === 'm') {  verb = 'move'; }

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


export function main(element: HTMLElement) {
   
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
    
    let term = new Terminal({
        theme: {
            foreground: '#00ff33'
        }
    });
    term.open(element);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    fitAddon.fit();
   
    let windowWidth =  Math.min(80, term.cols - 1);

    const writeln = (text: string) => {
        text = lineBreak(
            center(
                highlight(text), 
                windowWidth
            ), 
            windowWidth
        );
        for (const line of text.split('\n')){
            term.writeln(line);
        }
    }

    writeln(``);
    writeln(`>>Adventure time!<<`);
    writeln(`>>https://github.com/encse/text-adventure<<`);
    writeln(``);
    writeln(``);
    writeln(``);
    writeln(`- Ouch, that hurts! What's this {{darkness}}? Where is everyone?`);
    term.write('\n> ');
    let command = '';
    let buffer = '';

    term.onData(e => {
        buffer += e;
        if (buffer.endsWith(konamiCode)){
            command = konamiCode;
            e = '\r';
        }
        switch (e) {
          case '\r': // Enter
            term.writeln('\r');

            let res = step(command, state);
            let msg = ''
            if (typeof(res) == 'string'){
                msg = res;
            } else {
                state = { ...state, ...res[1] };
                msg = Array.isArray(res[0]) ? res[0].filter(x => x !== '').join(' ') : res[0];
            }
            command = '';
            buffer = '';

            writeln(msg.trim());
            term.write('\n> ');
            break;
          case '\u007F': // Backspace (DEL)
            if (command.length > 0) {
                term.write('\b \b');
                command = command.substring(0, command.length - 1);
            }
            break;
          default: // Print all other characters for demo
            if ((e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E)) || e >= '\u00a0') {
              command += e;
              term.write(e);
            }
        }
      });
}

