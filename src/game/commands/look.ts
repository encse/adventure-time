import {CommandResult} from '../loop';
import {findItemsByName, State} from '../state';
import {disambiguate, dontUnderstand} from './feedback';

export function look(state: State, obj: string): CommandResult {
    if (obj === '' || obj === 'around') {
        return state.room.look(state);
    } else {
        const items = findItemsByName(state, obj);
        if (items.length === 1) {
            return items[0].look(state);
        } else if (items.length > 1) {
            return disambiguate(state, items);
        } else {
            return dontUnderstand(state, obj);
        }
    }
}
