import { makeItem } from "./items";
import { roomColor } from "./room";

export const darkness = makeItem({
    name: 'darkness',
    examine: (state) => {
        if (roomColor(state) === 'black') {
            return `It's pitch dark. You wish you had a brass lantern.`;
        } else {
            return `The room is lit by ${roomColor(state)} colors`;
        }
    },
    look: (state) => state.darkness.examine(state),
    use: () => `Luke, I am your father`,
});