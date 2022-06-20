import { Color } from '../io/colors';
import { a } from '../io/utils';
import { roomColor } from "./items/room";

export type Result = string | [string | string[], Partial<State>];

export type ItemProps = {
    name: string | string[], 
    access? : 'available' | 'not found', 
    examine?: (state: State) => Result, 
    look?:  (state: State) => Result, 
    use?: (state: State) => Result, 
};

export type Item = {
    readonly name: string; 
    readonly access: 'available' | 'not found'; 
    readonly alias: readonly string[];
    readonly examine: (state: State) => Result; 
    readonly look: (state: State) => Result; 
    readonly use: (state: State) =>  Result; 
}

export type State = {
    readonly matches: Matches
    readonly darkness: Item;
    readonly installation: Item;
    readonly hole: Item;

    readonly leftStick: Stick;
    readonly centerStick: Stick;
    readonly missingStick: Stick;

    readonly smallDisk: Disk;
    readonly mediumDisk: Disk;
    readonly largeDisk: Disk;

    readonly room: Item;
    readonly wall: Item;
    readonly pocket: Item;
    readonly secrets: Secrets;
}

export type Matches = Item & {used: boolean};
export type Stick = Item & {used: boolean};
export type Secrets = Item & { konamiFound: boolean, iddqdFound: boolean }
export type DiskLocation = 'left stick' | 'center stick' | 'right stick';
export type Disk = Item & {location: DiskLocation, color: Color};

export function findItemsByName(state: State, name: string): Item[] {
    return Object.values(state).filter(item => item.access === 'available' && item.alias.includes(name));
}

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