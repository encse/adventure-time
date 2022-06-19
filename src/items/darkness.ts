import { makeItem, color } from "../game-defs";

export const darkness = makeItem({
    name: 'darkness',
    examine: (state) => {
        if (color(state) === 'black') {
            return `It's pitch dark. You wish you had a brass lantern.`;
        } else {
            return `The room is lit by ${color(state)} colors`;
        }
    },
    look: (state) => state.darkness.examine(state),
    use: () => `Luke, I am your father`,
});