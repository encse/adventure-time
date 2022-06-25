import {State} from '../state';
import {roomColor} from '../items/room';
import {CommandResult} from '../loop';

export function hello(state: State, obj: string): CommandResult {
    if (roomColor(state) === 'black') {
        return `Is it a good idea to start making noise in a dark room?\n`+
               `- Hello!\n`+
               `No answer. Not sure if this is a bad thing though.`;
    } else {
        return '- Khmm ... hello?\nNobody is here.';
    }
}
