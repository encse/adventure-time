import { getItemsByName, Result, State } from "../game-defs";
import { disambiguate } from "./feedback";

export function look(state: State, obj: string): Result {
    if (obj === '') {
        return state.room.examine(state);
    } else {
        const items = getItemsByName(state, obj);
        if (items.length === 1) {
            return items[0].examine(state)
        } else if (items.length > 1) {
            return disambiguate(items);
        } else {
            return `You don't see "{obj}" around.`;
        }
    }
}
