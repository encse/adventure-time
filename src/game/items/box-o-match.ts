import {Item, makeItem} from './items';
import {findItemsByName, State} from '../state';
import {a} from '../../io/utils';
import {roomColor} from './room';
import {disambiguate, dontUnderstand} from '../commands/feedback';
import {CommandResult} from '../loop';

export type Matches = Item<{ used: boolean }>;

export const matches: Matches = makeItem({
    used: false,
    name: ['matches', 'match', 'last match', 'box of matches'],
    examine: (state) => {
        let msg = `The small box brings back good memories. The Kick Stand bar! Those were the days... `+
            `Rocking the roads full throttle with Ben and the Polecats!\n\n`;
        if (state.matches.used) {
            msg += `Unfortunately the box is empty, it has only sentimental value now. `;
        } else {
            msg += `What's even better, the box has a <i>last match</i> ready for use. `;
        }
        return msg;
    },
    use: (state: State) => {
        if (state.matches.used) {
            return `You have ran out of matches.`;
        }

        let msg = '';
        if (roomColor(state) !== 'black') {
            msg = `Fwoosh... ouch. You drop your last match to the floor.`;
        } else {
            msg = `Fwoosh... sudden light illuminates the place for a moment. ` +
                `There is <i>${a(state.installation.name)}</i> in front of you, ` +
                `but you don't have time to observe it well. ` +
                `The fire goes out quickly and you stay alone in the darkness again.`;
        }
        const upd: Partial<State> = {
            installation: {...state.installation, accessible: true},
            matches: {...state.matches, used: true},
        };
        return [msg, upd];
    },
});

export function light(state: State, obj: string): CommandResult {
    if (obj === '') {
        return `What do you want to light?`;
    } else {
        const items = findItemsByName(state, obj);
        if (items.length === 1 && items[0] === state.matches) {
            return items[0].use(state);
        } else if (items.length === 1 && state.matches.used) {
            return `You have ran out of matches.`;
        } else if (items.length === 1) {
            return `That's not the best idea.`;
        } else if (items.length > 1) {
            return disambiguate(state, items);
        } else {
            return dontUnderstand(state, obj);
        }
    }
}
