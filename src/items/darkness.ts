import { makeItem, color } from "../game-defs";

export const darkness = makeItem({
    name:    'darkness', 
    examine: (state) => 
        color(state) === 'black' ? 
        `It's pitch dark. You wish you had a brass lantern.` :
        `The room is lit by ${color(state)} colors`,
    look:    (state) => state.darkness.examine(state),
    use:     () => `Luke, I am your father`,
});