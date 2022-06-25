import {CommandResult} from '../loop';
import {findItemsByName, State} from '../state';
import {dontUnderstand, disambiguate} from './feedback';

export function use(state: State, obj: string): CommandResult {
    if (obj === '') {
        return `What do you want to use?`;
    } else {
        const items = findItemsByName(state, obj);
        if (items.length === 1) {
            return items[0].use(state);
        } else if (items.length > 1) {
            return disambiguate(state, items);
        } else {
            return dontUnderstand(state, obj);
        }
    }
}
