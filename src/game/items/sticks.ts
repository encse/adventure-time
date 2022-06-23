import { Item, makeItem } from "./items";
import { State } from "../state";
import { roomColor } from "./room";
import { CommandResult } from "../loop";
import { DiskLocation } from "./disk";

export type Stick = Item<{location: DiskLocation, used: boolean}>;

export function isStick(item: Item): item is Stick {
    return item != null && item.name === 'stick';
}

export const leftStick: Stick = makeItem({
    location: to<DiskLocation>('left stick'),
    used: false, 
    name: ['stick', 'sticks', 'left stick'],
    examine: () => `It's made of wood, about two spans long.`,
    use: () => `The stick is stuck.`,
});

export const centerStick: Stick = makeItem({
    location: to<DiskLocation>('center stick'),
    used: false, 
    name: ['stick', 'sticks', 'middle stick', 'center stick'],
    examine: () => `It's made of wood, about two spans long.`,
    use: () => `The stick is stuck.`,
});

export const missingStick: Stick = makeItem({
    location: to<DiskLocation>('right stick'),
    used: false, 
    name: ['stick', 'sticks', 'stick from the floor'],
    examine: (state) => {
        if (state.missingStick.used) {
            return `The stick is stuck.`;
        } else if (state.hole.accessible) {
            return `The stick would fit into the hole in the installation.`
        } else {
            return `It's about two spans long. It's some kind of wood, based on its smell, it could be made of Elder.`;
        }
    },
    use: (state) => {
        if (state.missingStick.used) {
            return `The stick is stuck.`;
        } else if (state.hole.accessible) {
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

export function to<T>(t: T): T {return t;}

export function lumos(state: State) : CommandResult {
    if (roomColor(state) !== 'black') {
        return `There is enough light here.`
    } else if (state.missingStick.accessible && !state.missingStick.used) {
        return (
            `You start swinging the stick drawing magic runes in the air.\n`+
            `- Lumos! - You shout in the darkness.\n` +
            `Nothing happens. Magic left this place long time ago.`
        )
    } else {
        return "You don't have a magic wand."
    }
}