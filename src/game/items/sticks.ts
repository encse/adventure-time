import { Item, makeItem } from "./items";
import { State } from "../state";
import { roomColor } from "./room";
import { CommandResult } from "../loop";

export type Stick = Item<{used: boolean}>;

export const leftStick: Stick = makeItem({
    used: false, 
    name: ['stick', 'sticks', 'left stick'],
    access: 'not found',
    examine: () => `It's made of wood, about two spans long.`
});

export const centerStick: Stick = makeItem({
    used: false, 
    name: ['stick', 'sticks', 'middle stick', 'center stick'],
    access: 'not found',
    examine: () => `It's made of wood, about two spans long.`
});

export const missingStick: Stick = makeItem({
    used: false, 
    name: ['stick', 'sticks', 'stick from the floor'],
    access: 'not found',
    examine: (state) => {
        if (state.missingStick.used) {
            return `The stick is stuck.`;
        } else if (state.hole.access === 'available') {
            return `The stick would fit into the hole in the installation.`
        } else {
            return `It's about two spans long. It's some kind of wood, based on its smell, it could be made of Elder.`;
        }
    },
    use: (state) => {
        if (state.missingStick.used) {
            return `The stick is stuck.`;
        } else if (state.hole.access === 'available') {
            const msg = `You twist the stick into the hole of the installation like it was some ` +
                `IKEA furniture (an Ünstallation). It fits there perfectly, the whole thing starts to ` +
                `make sense now.`;

            const upd: Partial<State> = {
                missingStick: {
                    ...state.missingStick, 
                    alias: [...state.missingStick.alias, 'right stick'], 
                    used: true
                }
            } 
            return [msg, upd];
        } else {
            return lumos(state);
        }
    }
});

export function lumos(state: State) : CommandResult {
    if (roomColor(state) !== 'black') {
        return `There is enough light here.`
    } else if (state.missingStick.access === 'available' && !state.missingStick.used) {
        return (
            `You start swinging the stick drawing magic runes in the air.\n`+
            `- Lumos! - You shout in the darkness.\n` +
            `Nothing happens. Magic left this place long time ago.`
        )
    } else {
        return "You don't have a magic wand."
    }
}