import { Color } from './colors';
import {a} from './textUtils';

export type Result = string | [string | string[], Partial<State>];

export type ItemProps = {
    readonly name: string | string[], 
    readonly access? : 'available' | 'not found' | 'consumed', 
    readonly examine?: string | ((state: State) => Result), 
    readonly look?: string | ((state: State) => Result), 
    readonly use?: (state: State) => Result, 
};

export type Item = {
    readonly name: string; 
    readonly access: 'available' | 'not found' | 'consumed'; 
    readonly alias: readonly string[];
    readonly examine: (state: State) => Result; 
    readonly look: (state: State) => Result; 
    readonly use: (state: State) =>  Result; 
}

export type State = {
    readonly matches: Item & {used: boolean};
    readonly darkness: Item;
    readonly installation: Item;
    readonly hole: Item;

    readonly leftStick: Item;
    readonly centerStick: Item;
    readonly missingStick: Item & {used: boolean};

    readonly smallDisk: Disk;
    readonly mediumDisk: Disk;
    readonly largeDisk: Disk;

    readonly room: Item;
    readonly wall: Item;
    readonly pocket: Item;
    readonly secrets: Secrets;
}

export function color(state: State): Color {
    const r = state.smallDisk.location === 'center stick';
    const g = state.mediumDisk.location === 'center stick';
    const b = state.largeDisk.location === 'center stick';

    if (r && g && b) { return "white" }
    else if (r && g && !b) { return "yellow"; }
    else if (r && !g && b) { return "magenta"; }
    else if (r && !g && !b) { return "red"; }
    else if (!r && g && b) { return "cyan"; }
    else if (!r && g && !b) { return "green"; }
    else if (!r && !g && b) { return "blue"; }
    else if (!r && !g && !b) { return "black"; }
    else {
        throw new Error();
    }
}

export type Secrets = Item & { konamiFound: boolean, iddqdFound: boolean }
export type DiskLocation = 'left stick' | 'center stick' | 'right stick';
export type Disk = Item & {location: DiskLocation, color: Color};

export function getItemsByName(state: State, name: string): Item[] {
    return Object.values(state).filter(item => item.access === 'available' && item.alias.includes(name));
}

export function makeItem<T>(props: ItemProps & T) : Item & T {
    const name  = typeof(props.name) == 'string' ? props.name : props.name[0];
    const examine = 
        props.examine == null ? () => `It's just ${a(name)}` :
        typeof(props.examine) == 'string' ? () => props.examine as string :
        props.examine;

    const look = 
        props.look == null ? (state: State) => {
            if (color(state) === 'black') { 
                return `It's too dark, try to {{examine}} things with your hands instead.`;
            } else {
                return examine(state);
            }
        }:
        typeof(props.look) == 'string' ? () => props.look as string :
        props.look;

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