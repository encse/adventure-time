import { a } from '../io/utils';
import { CommandResult } from './game-loop';
import { roomColor } from "./items/room";
import { State } from './state';

export type Item = {
    readonly name: string; 
    readonly access: 'available' | 'not found'; 
    readonly alias: readonly string[];
    readonly examine: (state: State) => CommandResult; 
    readonly look: (state: State) => CommandResult; 
    readonly use: (state: State) =>  CommandResult; 
}

export type ItemProps = {
    name: string | string[], 
    access? : 'available' | 'not found', 
    examine?: (state: State) => CommandResult, 
    look?:  (state: State) => CommandResult, 
    use?: (state: State) => CommandResult, 
};

export function makeItem<T>(props: ItemProps & T) : Item & T {
    let name  = typeof(props.name) == 'string' ? props.name : props.name[0];
    let examine = props.examine ?? (() => `It's just ${a(name)}`);

    let look = props.look;
    if (look == null) {
        look = (state: State) => {
            if (roomColor(state) === 'black') { 
                return `It's too dark, try to <i>examine</i> things with your hands instead.`;
            } else {
                return examine(state);
            }
        };
    }

    return {
        ...props,
        name: name,
        access: props.access ?? 'available',
        alias: typeof(props.name) == 'string' ? [name] : props.name,
        examine: examine,
        look: look,
        use: props.use != null ? props.use : () => `You don't know how to use it.`,
   };
}
