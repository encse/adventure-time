import { a } from '../../io/utils';
import { CommandResult } from '../loop';
import { roomColor } from "./room";
import { State } from '../state';

export type Item<T={}> =  T & {
    readonly name: string; 
    readonly accessible: boolean; 
    readonly alias: readonly string[];
    readonly examine: (state: State) => CommandResult; 
    readonly look: (state: State) => CommandResult; 
    readonly use: (state: State) =>  CommandResult; 
}

export type ItemProps = {
    name: string | string[], 
    examine?: (state: State) => CommandResult, 
    look?:  (state: State) => CommandResult, 
    use?: (state: State) => CommandResult, 
};

export function makeItem<T>(props: ItemProps & T) : Item<T> {
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
        accessible: false,
        alias: typeof(props.name) == 'string' ? [name] : props.name,
        examine: examine,
        look: look,
        use: props.use != null ? props.use : () => `You don't know how to use it.`,
   };
}
