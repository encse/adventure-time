import { CommandResult } from "../loop";
import { Item, makeItem } from "./items";
import { State } from "../state";

export type Secrets = Item & { konamiFound: boolean, iddqdFound: boolean }

export const konamiCode = '\u001b[A\u001b[A\u001b[B\u001b[B\u001b[D\u001b[C\u001b[D\u001b[Cba';

export const secrets: Secrets = makeItem({
    konamiFound: false, 
    iddqdFound: false, 
    name: ['secret'],
    access: 'not found',
});

export function konami(state: State, obj: string): CommandResult {
    if (!state.secrets.konamiFound) {
        return ['You have found a secret!', {secrets: {...state.secrets, konamiFound: true}}]
    } else {
        return 'Cheater!'
    }
}

export function iddqd(state: State, obj: string): CommandResult {
    if (!state.secrets.iddqdFound) {
        return ['You have found a secret!', {secrets: {...state.secrets, iddqdFound: true}}]
    } else {
        return 'Cheater!'
    }
}
