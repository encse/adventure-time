import {CommandResult} from '../loop';
import {State} from '../state';

export function help(state: State, obj: string): CommandResult {
    return (
        `This little game is a glimpse of the past. It's written in the style of `+
        `the original text adventures such as Colossal Cave Adventure or Zork.\n\n` +

        `To advance forward, you need to <i>look</i> around, <i>examine</i> things and `+
        `<i>use</i> them in some way. To make things a little faster, you can also abbreviate ` +
        `commands with single letters such as l, x or u if you wish.\n\n` +

        `If you are smart enough you will find some references to other games, books or movies. ` +
        `Slow down and have a rest. Enjoy your stay!`
    );
}
