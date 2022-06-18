import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { highlight, lineBreak } from './textUtils';
import {State, Result, color, getItemsByName, disambiguate} from './game-defs'
import {room} from './items/room';
import { wall } from './items/wall';
import { pocket } from './items/pocket';
import { smallDisk, mediumDisk, largeDisk } from './items/disk';
import { darkness } from './items/darkness';
import { matches } from './items/box-of-matches';
import { installation, move } from './items/hanoi';
import { centerStick, leftStick, lumos, missingStick } from './items/sticks';
import { hole } from './items/hole';

const konami = '\u001b[A\u001b[A\u001b[B\u001b[B\u001b[D\u001b[C\u001b[D\u001b[Cba';
let konamiFound: boolean;
let iddqd: boolean;


function step(st: string, state: State): Result {
    if (st === konami) {
        if (!konamiFound) {
            konamiFound = true;
            return 'You have found a secret!';
        } else {
            return 'Cheater!'
        }
    } else if (st === 'iddqd') {
        if (!iddqd) {
            iddqd = true;
            return 'You have found a secret!';
        } else {
            return 'Cheater!'
        }
    }

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
            if (color(state) === 'black') {
                return "Is it a good idea to start making noise in a dark room?\n- Hello!\nNo answer. Not sure if this is a bad thing though.";
            } else {
                return "- Khmm ... hello?\nNobody is here.";
            }
        case 'lumos': 
            return lumos(state);
        case 'inventory': 
            return step('examine pocket', state);
        case 'help':
            return "Look around, examine things and try to use them.";
        case 'look':
        case 'examine':
            if (obj === '') {
                return state.room[verb](state);
            } else {
                const items = getItemsByName(state, obj);
                if (items.length === 1) {
                    return items[0][verb](state)
                } else if (items.length > 1) {
                    return disambiguate(items);
                } else {
                    return `You don't have it.`;
                }
            }
        case 'use':
            if (obj === '') {
                return `What do you want to use?`;
            } else {
                const items = getItemsByName(state, obj);
                if (items.length === 1 ) {
                    return items[0].use(state);
                } else if (items.length > 1){
                    return disambiguate(items);
                } else {
                    return `You don't have it.`;
                }
            }
        case 'move': {
            return move(state, obj)
        }
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
    };
    
    let term = new Terminal();
    term.open(element);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddon.fit();
   
    let windowWidth = 80;

    term.onResize(evt => {
        windowWidth = Math.min(80, evt.cols);
    })

    term.writeln(``);
    term.writeln(`                Adventure time!               `);
    term.writeln(`    https://github.com/encse/text-adventure   `);
    term.writeln(``);
    term.writeln(``);
    term.writeln(``);
    term.writeln(highlight(`- Ouch, that hurts! What's this {{darkness}}? Where is everyone?`));
    term.write('\n> ');
    let command = '';
    let buffer = '';

    term.onData(e => {
        buffer += e;
        if (buffer.endsWith(konami)){
            command = konami;
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

            msg = msg.trim();
            msg = highlight(msg);
            term.writeln(lineBreak(msg, windowWidth).replaceAll('\n', '\r\n'));
            command = '';
            buffer = '';
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
