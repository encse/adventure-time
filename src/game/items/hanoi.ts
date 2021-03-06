import {colorize} from '../../io/colors';
import {makeItem, Item} from './items';
import {State, findItemsByName, getFullName} from '../state';
import {disambiguate} from '../commands/feedback';
import {Disk, isDisk} from './disk';
import {CommandResult, skipArticles} from '../loop';
import {isStick, Stick} from './sticks';

export const installation = makeItem({
    name: ['weird installation', 'installation'],
    examine: (state: State): CommandResult => {
        let msg: string;
        if (state.missingStick.used) {
            msg = `It's a tower of Hanoi game with a <i>small</i>, a <i>medium</i> and a <i>large disk</i>.`;
        } else {
            msg = `The installation consists of a <i>small</i>, a <i>medium</i> and a <i>large disk</i> on ` +
                `two <i>sticks</i>. There is a <i>hole</i> for a third stick to the right.`;
        }

        const upd: Partial<State> = {
            hole: {...state.hole, accessible: true},

            leftStick: {...state.leftStick, accessible: true},
            centerStick: {...state.centerStick, accessible: true},

            smallDisk: {...state.smallDisk, accessible: true},
            mediumDisk: {...state.mediumDisk, accessible: true},
            largeDisk: {...state.largeDisk, accessible: true},
        };
        return [msg + describeHanoi(state), upd];
    },
});

export function move(state: State, obj: string): CommandResult {
    if (findItemsByName(state, 'disk').length === 0) {
        return `You have nothing to move.`;
    } else if (obj.indexOf(' to ') < 0) {
        return 'Try "move <some> disk to <position>".';
    } else {
        const parts = obj.split(' to ');
        let [what, where] = [parts[0].trim(), skipArticles(parts[1].trim())];

        if (where === 'left') {
            where = 'left stick';
        }
        if (where === 'right' && !state.missingStick.used) {
            where = 'center stick';
        }
        if (where === 'right') {
            where = 'right stick';
        }
        if (where === 'center') {
            where = 'center stick';
        }
        if (where === 'middle') {
            where = 'center stick';
        }

        const objAs = findItemsByName(state, what);
        const objBs = findItemsByName(state, where);
        const disk = objAs[0];
        const toStick = objBs[0];

        if (!isDisk(disk) || !isStick(toStick)) {
            return `Try "move <some> disk to <position>".`;
        } else if (objAs.length > 1) {
            return disambiguate(state, objAs);
        } else if (objBs.length > 1) {
            return disambiguate(state, objBs);
        } else if (toStick.location === disk.location) {
            return `It's already there.`;
        } else if (!isTopDisk(disk, state)) {
            return (
                `The disks are heavy and you don't want to break them, `+
                `try moving the disk on the top of the stick first. `
            );
        } else if (!allowedPositions(disk, state).includes(toStick)) {
            return `You are not a Feng shui expert, but that disk would not look right there.`;
        } else {
            const from = disk.location;

            const upd: Partial<State> =
                disk === state.smallDisk ? {smallDisk: {...state.smallDisk, location: toStick.location}} :
                    disk === state.mediumDisk ? {mediumDisk: {...state.mediumDisk, location: toStick.location}} :
                        {largeDisk: {...state.largeDisk, location: toStick.location}};

            const stMove = `You carefully lift the disk and place it on the ${getFullName(state, toStick)}.`;
            const stAction =
                from === 'center stick' ? `As soon as you lift the disk, it stops glowing.` :
                    toStick === state.centerStick ? `The disk starts glowing in ${disk.color}, illuminating the room.` :
                        '';

            state = {...state, ...upd};
            const msg = [stMove, stAction, describeHanoi(state)].filter((x) => x !== '').join(' ');
            return [msg, state];
        }
    }
}

function describeHanoi(state: State): string {
    const empty = colorize('    |    ', 'grey');

    const nonLitDisks = new Map<Disk, string>([
        [state.smallDisk, colorize('  (...)  ', 'grey')],
        [state.mediumDisk, colorize(' (.....) ', 'grey')],
        [state.largeDisk, colorize('(.......)', 'grey')],
    ]);

    const litDisks = new Map<Disk, string>([
        [state.smallDisk, colorize('  (***)  ', state.smallDisk.color)],
        [state.mediumDisk, colorize(' (*****) ', state.mediumDisk.color)],
        [state.largeDisk, colorize('(*******)', state.largeDisk.color)],
    ]);

    const rowByStick = {
        'left stick': 3,
        'center stick': 3,
        'right stick': 3,
    };

    const colByStick = {
        'left stick': 0,
        'center stick': 1,
        'right stick': 2,
    };

    const items: string[][] = [];

    for (let row = 0; row < 4; row++) {
        items[row] = [];
        for (const col of Object.values(colByStick)) {
            if (!state.missingStick.used && col === colByStick['right stick']) {
                items[row].push('          ');
            } else {
                items[row].push(empty);
            }
        }
    }

    for (const disk of [state.largeDisk, state.mediumDisk, state.smallDisk]) {
        items[rowByStick[disk.location]--][colByStick[disk.location]] =
            disk.location === 'center stick' ? litDisks.get(disk)! : nonLitDisks.get(disk)!;
    }

    let res = `\n\n`;
    for (let row = 0; row < 4; row++) {
        res += '  ' + items[row].join('  ') + '\n';
    }

    if (!state.missingStick.used) {
        res += colorize(` =====+==========+==========-=====`, 'grey');
    } else {
        res += colorize(` =====+==========+==========+=====`, 'grey');
    }
    return res;
}

function allowedPositions(disk: Disk, state: State): Item[] {
    if (!isTopDisk(disk, state)) {
        return [];
    }

    let targetLocations: Stick[] = state.missingStick.used ?
        [state.leftStick, state.centerStick, state.missingStick] :
        [state.leftStick, state.centerStick];

    if (disk === state.smallDisk || disk === state.mediumDisk || disk === state.largeDisk) {
        targetLocations = targetLocations.filter((x) => x.location !== state.smallDisk.location);
    }

    if (disk === state.mediumDisk || disk === state.largeDisk) {
        targetLocations = targetLocations.filter((x) => x.location !== state.mediumDisk.location);
    }

    if (disk === state.largeDisk) {
        targetLocations = targetLocations.filter((x) => x.location !== state.largeDisk.location);
    }

    return targetLocations;
}

function isTopDisk(disk: Disk, state: State) {
    if (disk === state.smallDisk) {
        return true;
    } else if (disk === state.mediumDisk) {
        return state.smallDisk.location !== disk.location;
    } else {
        return state.smallDisk.location !== disk.location && state.mediumDisk.location !== disk.location;
    }
}
