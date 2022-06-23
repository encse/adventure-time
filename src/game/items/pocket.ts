import { CommandResult } from "../loop";
import { makeItem } from "./items";
import { State } from "../state";

export const pocket = makeItem({
    name: 'pocket', 
    examine: (state) => {
        let st = [`You have:`];
        if (state.matches.accessible) {
            st.push(`- a box of matches. `);
        } 

        if (state.missingStick.accessible && !state.missingStick.used) {
            st.push(`-  a stick. `);
        }

        return st.join('\n');
    },
    use: (state) => {
        return state.pocket.examine(state);
    }
});

export function inventory(state: State, obj: string): CommandResult {
    return state.pocket.examine(state);
}