import { Item, makeItem } from "./items";
import { State } from "../state";
import { a } from "../../io/utils";
import { roomColor } from "./room";

export type Matches = Item<{used: boolean}>;

export const matches: Matches = makeItem({
    used: false,
    name: ['matches', 'match', 'box of matches'],
    examine: (state) =>  {
        let msg = `The small box brings back good memories. The Kickstand bar! Those were the days! `;
        if (state.matches.used) {
            msg += `Unfortunately the box is empty, it has only nostalgic value now. `;
        } else {
            msg += `And it even has a last match, ready for use. `;
        }
        return msg;
    },
    use: (state: State) =>  {
        if (state.matches.used) {
            return `You have ran out of matches.`
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
        const upd : Partial<State> = {
            installation: {...state.installation, accessible: true},
            matches: {...state.matches, used: true},
        };
        return [msg, upd];
    }
});