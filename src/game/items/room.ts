import { Color } from '../../io/colors';
import {State, makeItem, Result} from '../defs';

export const room = makeItem({
    name: 'room',
    look: (state:State): Result =>  {
        if (roomColor(state) !== 'black') {
            return state.room.examine(state);
        } else if (!state.matches.used) {
            return `You don't see anything, but you have a <i>box of matches</i> in your <i>pocket</i>.`;
        } else {
            return `Your eyes got used to the darkness already. But apart from the chaotic triggering of your neurons making some fake sparkles you don't see a thing.`;
        }
    },
    examine: (state: State): Result =>  {
        let stRoom = '';
        let stWall = '';
        let stStick = '';

        let upd: Partial<State> = {};

        if (roomColor(state) !== 'black') {
            stRoom = `The dim light of the installation fills the room with ${roomColor(state)} colors. It's much more friendly now. `;
            stWall = `You notice some writing on the <i>wall</i>. `
        } else {
            stRoom =
                "You go down to all fours and start groping around the room. " +
                "The floor feels cold, probably marble. ";
        }

        if (state.missingStick.access === 'not found') {
            stStick = 'You have found a <i>stick</i> on the floor. ';
            upd = {missingStick: {...state.missingStick, access: 'available'}}
        }

        const msg = stRoom + stWall + stStick;
        return [msg, upd];
    }
});

export function roomColor(state: State): Color {
    const r = state.smallDisk.location === 'center stick';
    const g = state.mediumDisk.location === 'center stick';
    const b = state.largeDisk.location === 'center stick';

    if (r && g && b) { return "white" }
    else if (r && g && !b) { return "yellow"; }
    else if (r && !g && b) { return "magenta"; }
    else if (r && !g && !b) { return "red"; }
    else if (!r && g && b) { return "cyan"; }
    else if (!r && g && !b) { return "green"; }
    else if (!r && !g && b) { return "blue"; }
    else if (!r && !g && !b) { return "black"; }
    else {
        throw new Error();
    }
}