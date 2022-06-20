import {State, makeItem, Result, color} from '../game-defs';

export const room = makeItem({
    name: 'room',
    look: (state:State): Result =>  {
        if (color(state) !== 'black') {
            return state.room.examine(state);
        } else if (!state.matches.used) {
            return `You don't see anything, but you have a {{box of matches}} in your {{pocket}}.`;
        } else {
            return `Your eyes got used to the darkness already. But apart from the chaotic triggering of your neurons making some fake sparkles you don't see a thing.`;
        }
    },
    examine: (state: State): Result =>  {
        let stRoom = '';
        let stWall = '';
        let stStick = '';

        let upd: Partial<State> = {};

        if (color(state) !== 'black') {
            stRoom = `The dim light of the installation fills the room with ${color(state)} colors. It's much more friendly now. `;
            stWall = `You notice some writing on the {{wall}}. `
        } else {
            stRoom =
                "You go down to all fours and start groping around the room. " +
                "The floor feels cold, probably marble. ";
        }

        if (state.missingStick.access === 'not found') {
            stStick = 'You have found a {{stick}} on the floor. ';
            upd = {missingStick: {...state.missingStick, access: 'available'}}
        }

        const msg = stRoom + stWall + stStick;
        return [msg, upd];
    }
});