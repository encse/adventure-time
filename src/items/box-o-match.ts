import { makeItem, State, color } from "../game-defs";
import { a } from "../textUtils";

export const matches = {
    used: false,
    ...makeItem({
        name: ['matches', 'match', 'box of matches'],
        examine: (state) => 
            state.matches.used ?
                `The small box brings back good memories. The Kickstand bar! Those were the days! Unfortunately the box is empty, it has only nostalgic value now. `:
                `The small box brings back good memories. The Kickstand bar! Those were the days! And it even has a last match, ready for use. `,
        use: (state: State) =>  {
            if (state.matches.used) {
                return `You have ran out of matches.`
            } 
            
            let msg = '';
            if (color(state) !== 'black') {
                msg = `Fwoosh... ouch. You drop your last match to the floor.`;
            } else {
                msg = `Fwoosh... sudden light illuminates the place for a moment. ` +
                    `There is {{${a(state.installation.name)}}} in front of you, ` +
                    `but you don't have time to observe it well. ` +
                    `The fire goes out quickly and you stay alone in the darkness again.`;
            }
            const upd : Partial<State> = {
                installation: {...state.installation, access: 'available'},
                matches: {...state.matches, used: true},
            };
            return [msg, upd];
        }
    })
};