import { findItemsByName, Result, State } from "../defs";
import { disambiguate, dontUnderstand } from "./feedback";

export function look(state: State, obj: string): Result {
    if (obj === '') {
        return state.room.look(state);
    } else {
        const items = findItemsByName(state, obj);
        if (items.length === 1) {
            return items[0].look(state)
        } else if (items.length > 1) {
            return disambiguate(items);
        } else {
            return dontUnderstand(state, obj);
        }
    }
}