import {Color} from '../../io/colors';
import {CommandResult} from '../loop';
import {makeItem} from './items';
import {State} from '../state';

export const room = makeItem({
    name: 'room',
    look: (state: State): CommandResult => {
        if (roomColor(state) !== 'black') {
            return state.room.examine(state);
        } else if (!state.matches.used) {
            return `You don't see anything, but you have a <i>box of matches</i> in your <i>pocket</i>.`;
        } else {
            return (
                `Your eyes got used to the darkness already. ` +
                `But apart from the chaotic triggering of your neurons making some `+
                `fake sparkles you don't see a thing.`
            );
        }
    },
    examine: (state: State): CommandResult => {
        let stRoom = '';
        let stWall = '';
        let stStick = '';
        let upd: Partial<State> = {};

        if (roomColor(state) !== 'black') {
            stRoom =
                `The dim light of the installation fills the room with ${roomColor(state)} colors. `+
                `It's much more friendly now. `;
            stWall = `You notice some writing on the <i>wall</i>. `;
        } else {
            stRoom =
                `You go down to all fours and start groping around the room. ` +
                `The floor feels cold, probably marble. `;
        }

        if (!state.missingStick.accessible) {
            stStick = `You have found a <i>stick</i> on the floor. `;
            upd = {missingStick: {...state.missingStick, accessible: true}};
        }

        const msg = stRoom + stWall + stStick;
        return [msg, upd];
    },
});

export function roomColor(state: State): Color {
    const red = roomHasColorComponent(state, 'red');
    const green = roomHasColorComponent(state, 'green');
    const blue = roomHasColorComponent(state, 'blue');

    if (red && green && blue) {
        return 'white';
    } else if (red && green && !blue) {
        return 'yellow';
    } else if (red && !green && blue) {
        return 'magenta';
    } else if (red && !green && !blue) {
        return 'red';
    } else if (!red && green && blue) {
        return 'cyan';
    } else if (!red && green && !blue) {
        return 'green';
    } else if (!red && !green && blue) {
        return 'blue';
    } else if (!red && !green && !blue) {
        return 'black';
    } else {
        throw new Error();
    }
}

function roomHasColorComponent(state: State, color: 'red' | 'green' | 'blue') {
    for (const disk of [state.smallDisk, state.mediumDisk, state.largeDisk]) {
        if (disk.color === color) {
            return disk.location === 'center stick';
        }
    }
    return false;
}
