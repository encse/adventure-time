import { CommandResult } from "../loop";
import { Item } from "../items/items";
import { findItemsByName, getFullName, State } from "../state";

export function disambiguate(state: State, items: Item[]): CommandResult {
    let msg = `Which one do you want?\n`;
    let list = items.map(item => `- ` + getFullName(state, item)).join('\n');
    return msg + list;
}

export function dontUnderstand(state: State, thing: string): CommandResult {
    if (findItemsByName(state, thing).length > 0) {
        return `What do you want to do with the ${thing}?`
    } else {
        return `I don't understand "${thing}".`;
    }
}