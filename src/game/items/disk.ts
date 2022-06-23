import { Color } from "../../io/colors";
import { Item, makeItem } from "./items";
import { State } from "../state";

export type DiskLocation = 'left stick' | 'center stick' | 'right stick';
export type Disk = Item<{location: DiskLocation, color: Color}>;
export const smallDisk = makeDisk('small', 'red', state => state.smallDisk);
export const mediumDisk = makeDisk('medium', 'green', state => state.mediumDisk);
export const largeDisk = makeDisk('large', 'blue', state => state.largeDisk);

export function isDisk(item: Item): item is Disk {
    return item != null && item.name === 'disk';
}
function makeDisk(shortName: string, color: Color, get: (state: State) => Disk): Disk {
    const fullName = shortName +' disk'
    return makeItem({
        location: 'left stick',
        color: color,
        name: ['disk', 'disks', fullName],
        examine: (state) => {
            const self = get(state);
            if (self.location === 'center stick') {
                return `It's made of glass and glowing in ${self.color}, illuminating the room.`;
            } else {
                return `It's made of glass.`;
            }
        },
        use: () => `You can try to move it to an other stick.`
    });
}

