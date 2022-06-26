import {Item} from './items/items';
import {matches, Matches} from './items/box-o-match';
import {darkness} from './items/darkness';
import {Disk, largeDisk, mediumDisk, smallDisk} from './items/disk';
import {installation} from './items/hanoi';
import {hole} from './items/hole';
import {pocket} from './items/pocket';
import {room} from './items/room';
import {secrets, Secrets} from './items/secrets';
import {centerStick, leftStick, missingStick, Stick} from './items/sticks';
import {wall} from './items/wall';
import {skipArticles} from './loop';

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
    darkness: {...darkness, accessible: true},
    room: {...room, accessible: true},
    pocket: {...pocket, accessible: true},
    matches: {...matches, accessible: true},
    wall: {...wall, accessible: true},
    installation,
    hole,
    leftStick,
    centerStick,
    missingStick,
    smallDisk,
    mediumDisk,
    largeDisk,
    secrets,
};

export function findItemsByName(state: State, name: string): Item[] {
    return Object.values(state).filter((item) =>
        item.accessible && [...item.alias].includes(skipArticles(name)),
    );
}

export function getFullName(state: State, item: Item): string {
    for (const name of [...item.alias].reverse()) {
        if (findItemsByName(state, name).length === 1) {
            return name;
        }
    }
    return item.name;
}
