import { colorize } from "../../io/colors";
import { makeItem, Item } from "../items";
import { State, findItemsByName } from "../state";
import { disambiguate } from "../commands/feedback";
import { Disk, DiskLocation } from "./disk";
import { CommandResult } from "../game-loop";

export const installation = makeItem({
    name: ['weird installation', 'installation'],
    access: 'not found',
    examine: (state: State): CommandResult => {

        const msg = state.missingStick.used ?
            `It's a tower of Hanoi game with a <i>small</i>, a <i>medium</i> and a <i>large disk</i>.` :
            `The installation consists of a <i>small</i>, a <i>medium</i> and a <i>large disk</i> on two <i>sticks</i>. There is a <i>hole</i> for a third stick to the right.`;

        const upd: Partial<State> = {
            hole:        {...state.hole, access: 'available'},

            leftStick:   {...state.leftStick,  access: 'available'},
            centerStick: {...state.centerStick,  access: 'available'},
            
            smallDisk:   {...state.smallDisk,  access: 'available'},
            mediumDisk:  {...state.mediumDisk,  access: 'available'},
            largeDisk:   {...state.largeDisk,  access: 'available'},
        };
        return [msg + describeHanoi(state), upd];
    }
});

export function move(state: State, obj: string): CommandResult {
    if (findItemsByName(state, 'disk').length === 0) {
        return `You have nothing to move.`;
    } else if (obj.indexOf(' to ') < 0) {
        return 'Try "move <some> disk to <position>".';
    } else {
        const parts = obj.split(' to ');
        const what = parts[0].trim();
        let where = parts[1].trim();

        if (where === 'left') {where = 'left stick';}
        if (where === 'right' && !state.missingStick.used ) {where = 'center stick';}
        if (where === 'right') {where = 'right stick';}
        if (where === 'center') {where = 'center stick';}
        if (where === 'middle') {where = 'center stick';}
       
        const objAs = findItemsByName(state, what);
        const objBs = findItemsByName(state, where);
        const disk = objAs[0] as Disk;
        const toStick = objBs[0];

        if (disk == null || disk.name !== 'disk' || toStick == null || toStick.name !== 'stick') {
            return `Try "move <some> disk to <position>".`
        } else if (objAs.length > 1) {
            return disambiguate(objAs);
        } else if (objBs.length > 1) {
            return disambiguate(objBs);
        } else if (toStick === findItemsByName(state, disk.location)[0]) {
            return `It's already there.`;
        } else if (!isTopDisk(disk, state)) {
            return `The disks are heavy and you don't want to break them, try moving the disk on the top of the stick first. `;
        } else if (!allowedPositions(disk, state).includes(toStick)) {
            return `You are not a Feng shui expert, but that disk would not look right there.`;
        } else {
            const fromStick = findItemsByName(state, disk.location)[0];
        
            const upd: Partial<State> = 
                disk === state.smallDisk ?  {smallDisk: {...state.smallDisk, location: fullName(toStick) as DiskLocation}} :
                disk === state.mediumDisk ? {mediumDisk: {...state.mediumDisk, location: fullName(toStick) as DiskLocation}} :
                                            {largeDisk: {...state.largeDisk, location: fullName(toStick) as DiskLocation}};

            const stMove = `You carefully lift the disk and place it on the ${fullName(toStick)}.`;
            const stAction =
                fromStick === state.centerStick ? `As soon as you lift the disk, it stops glowing.` :
                toStick === state.centerStick ? `The disk starts glowing in ${disk.color}, illuminating the room.` :
                '';

            state = {...state, ...upd};
            return [[stMove, stAction, describeHanoi(state)], state];
        }
    }
}

function describeHanoi(state: State): string {

    const empty = colorize('    |    ', 'grey');

    const nonLitDisks = new Map<Disk, string>([
        [state.smallDisk,  colorize('  [...]  ', 'grey')],
        [state.mediumDisk, colorize(' [.....] ', 'grey')],
        [state.largeDisk,  colorize('[.......]', 'grey')],
    ])

    const litDisks = new Map<Disk, string>([
        [state.smallDisk,  colorize('  [***]  ', state.smallDisk.color)],
        [state.mediumDisk, colorize(' [*****] ', state.mediumDisk.color)],
        [state.largeDisk,  colorize('[*******]', state.largeDisk.color)],
    ])

    const rowByStick = {
        'left stick': 3,
        'center stick': 3,
        'right stick': 3
    }

    const colByStick = {
        'left stick': 0,
        'center stick': 1,
        'right stick': 2
    }

    let items: string[][]= [];

    for (let row = 0; row < 4; row++) {
        items[row] = []
        for (let col of Object.values(colByStick)) {
            if (!state.missingStick.used && col === colByStick['right stick']) {
                items[row].push("          ")
            } else {
                items[row].push(empty)
            }
        }
    }

    for (let disk of [state.largeDisk, state.mediumDisk, state.smallDisk]){
        items[rowByStick[disk.location]--][colByStick[disk.location]] = 
            disk.location === 'center stick' ? litDisks.get(disk)! : nonLitDisks.get(disk)!
    }

    let res = `\n\n`;
    for (let row = 0; row < 4; row++) {
        res += '  '+ items[row].join('  ') + '\n';
    }

    if(!state.missingStick.used){
        res += colorize(` =====+==========+==========-=====\n`, 'grey');
    }  else {
        res += colorize(` =====+==========+==========+=====\n`, 'grey');
    }
    return res;
}

function allowedPositions(disk: Disk, state: State):  Item[] {
    let targetLocations: string[] = state.missingStick.used ? 
        ['left stick', 'center stick', 'right stick'] : 
        ['left stick', 'center stick'];

    if (disk === state.smallDisk) {
        targetLocations = targetLocations.filter(x => x !== state.smallDisk.location);
    } else if (disk === state.mediumDisk && state.smallDisk.location === state.mediumDisk.location) {
        targetLocations = [];
    } else if (disk === state.mediumDisk) {
        targetLocations = targetLocations.filter(x => x !== state.smallDisk.location && x !== state.mediumDisk.location);
    } else if (disk === state.largeDisk && state.largeDisk.location === state.mediumDisk.location) {
        targetLocations = [];
    } else if (disk === state.largeDisk && state.largeDisk.location === state.smallDisk.location) {
        targetLocations = [];
    } else if (disk === state.largeDisk) {
        targetLocations = targetLocations.filter(x => x !== state.smallDisk.location && x !== state.mediumDisk.location && x !== state.largeDisk.location);
    }

    return targetLocations.map(location => findItemsByName(state, location)[0]);
}

function isTopDisk(disk: Disk, state: State) {
    if (disk === state.smallDisk) {
        return true;
    } else if (disk === state.mediumDisk) {
        return state.smallDisk.location !== disk.location;
    } else  {
        return state.smallDisk.location !== disk.location && state.mediumDisk.location !== disk.location;
    }
}

function fullName(item: Item) {
    return item.alias[item.alias.length - 1];
}