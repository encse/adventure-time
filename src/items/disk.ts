import { Color } from "../colors";
import { Disk, getItemsByName, makeItem } from "../game-defs";

export const smallDisk = makeDisk('small', 'red');
export const mediumDisk = makeDisk('medium', 'green');
export const largeDisk = makeDisk('large', 'blue');

function makeDisk(shortName: string, color: Color): Disk {
    const fullName = shortName +' disk'
    return {
        location: 'left stick',
        color: color,
        ...makeItem({
            access: 'not found',
            name: ['disk', 'disks', fullName],
            examine: (state) => {
                const self = getItemsByName(state, fullName)[0] as Disk;
                if (self == null) {
                    return `You don't have it.`;
                } else if (self.location === 'center stick') {
                    return `It's made of glass and glowing in ${self.color}, illuminating the room.`;
                } else {
                    return `It's made of glass.`;
                }
            },
            use: () => `You can try to move it to an other stick.`
        })
    };
}

