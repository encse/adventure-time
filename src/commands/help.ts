import { Result, State } from "../game-defs";

export function help(state: State, obj: string): Result {
   return "{{Look}} around, {{examine}} things and try to {{use}} them.";
}