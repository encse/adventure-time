import { Color } from "../../io/colors";
import { Item, makeItem } from "./items";
import { findItemsByName } from "../state";

export type DiskLocation = 'left stick' | 'center stick' | 'right stick';
export type Disk = Item & {location: DiskLocation, color: Color};

export const smallDisk = makeDisk('small', 'red');
export const mediumDisk = makeDisk('medium', 'green');
export const largeDisk = makeDisk('large', 'blue');

function makeDisk(shortName: string, color: Color): Disk {
    const fullName = shortName +' disk'
    return makeItem({
        location: 'left stick',
        color: color,
        access: 'not found',
        name: ['disk', 'disks', fullName],
        examine: (state) => {
            const self = findItemsByName(state, fullName)[0] as Disk;
            if (self == null) {
                return `You don't have it.`;
            } else if (self.location === 'center stick') {
                return `It's made of glass and glowing in ${self.color}, illuminating the room.`;
            } else {
                return `It's made of glass.`;
            }
        },
        use: () => `You can try to move it to an other stick.`
    });
}

