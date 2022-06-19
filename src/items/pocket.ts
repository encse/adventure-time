import { makeItem, Result, State } from "../game-defs";

export const pocket = makeItem({
    name: 'pocket', 
    examine: (state) => {
        let st = ``;
        if (state.matches.access === 'available') {
            st += `You have a box of matches. `;
        } 

        if (state.missingStick.access === 'available' && !state.missingStick.used) {
            st += `You have a stick. `;
        }

        return st;
    },
    use: (state) => {
        return state.pocket.examine(state);
    }
});

export function inventory(state: State, obj: string): Result {
    return state.pocket.examine(state);
}