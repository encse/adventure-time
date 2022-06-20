import { Item, Result, State } from "../defs";

export function disambiguate(items: Item[]) {
    let msg = `Which one do you want?\n`;
    let list = items.map(item => `- ` + item.alias[item.alias.length - 1]).join('\n');
    return msg + list + '\n';
}

export function dontUnderstand(state: State, obj: string): Result {
    return `I don't understand "${obj}".`;
}