import {CommandResult} from '../loop';
import {makeItem} from './items';
import {getFullName, State} from '../state';

export const pocket = makeItem({
    name: 'pocket',
    examine: (state) => {
        const st = [`You have:`];
        if (state.matches.accessible) {
            st.push(`- ${getFullName(state, state.matches)}. `);
        }

        if (state.missingStick.accessible && !state.missingStick.used) {
            st.push(`- ${getFullName(state, state.missingStick)}. `);
        }

        return st.join('\n');
    },
    use: (state) => {
        return state.pocket.examine(state);
    },
});

export function inventory(state: State, obj: string): CommandResult {
    return state.pocket.examine(state);
}
