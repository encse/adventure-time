import { Item } from './items/items';
import { matches, Matches } from './items/box-o-match';
import { darkness } from './items/darkness';
import { Disk, largeDisk, mediumDisk, smallDisk } from './items/disk';
import { installation } from './items/hanoi';
import { hole } from './items/hole';
import { pocket } from './items/pocket';
import { room } from './items/room';
import { secrets, Secrets } from './items/secrets';
import { centerStick, leftStick, missingStick, Stick } from './items/sticks';
import { wall } from './items/wall';


export type State = {
    readonly matches: Matches;
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
    readonly pocket: Item
    readonly secrets: Secrets;
};

export const initialState: State = {
    installation,
    hole,
    leftStick,
    centerStick,
    missingStick,
    matches,
    darkness,
    room,
    smallDisk,
    mediumDisk,
    largeDisk,
    wall,
    pocket,
    secrets,
};

export function findItemsByName(state: State, name: string): Item[] {
    return Object.values(state).filter(item => 
        item.access === 'available' && 
        [...item.alias, ...item.alias.map( x=> 'the ' + x )].includes(name)
    );
}
