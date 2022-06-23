import { CommandResult } from "../loop";
import { State } from "../state";

export function help(state: State, obj: string): CommandResult {
    return "<i>Look</i> around, <i>examine</i> things and try to <i>use</i> them.";
}