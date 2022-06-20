import { makeItem, Result, State } from "../defs";

export const pocket = makeItem({
    name: 'pocket', 
    examine: (state) => {
        let st = [`You have:`];
        if (state.matches.access === 'available') {
            st.push(`- a box of matches. `);
        } 

        if (state.missingStick.access === 'available' && !state.missingStick.used) {
            st.push(`- You have a stick. `);
        }

        return st.join('\n');
    },
    use: (state) => {
        return state.pocket.examine(state);
    }
});

export function inventory(state: State, obj: string): Result {
    return state.pocket.examine(state);
}