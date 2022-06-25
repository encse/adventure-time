import {colorize} from '../../io/colors';
import {makeItem} from './items';
import {State} from '../state';
import {roomColor} from './room';

export const wall = makeItem({
    name: 'wall',
    examine: (state) => {
        if (roomColor(state) === 'black') {
            return `It's a wall, made of concrete.`;
        } else if (roomColor(state) === 'white') {
            return `There is a message on the wall. It says: ` + describeWall(state); ;
        } else {
            return `The wall is painted to black, but you see some colorful letters:` + describeWall(state);
        }
    },
});

function describeWall(state: State): string {
    const lines = [
        ``,
        ``,
        `    _____  _______      _____    `,
        `  /  |  | \\   _  \\    /  |  |  `,
        ` /   |  |_/  /_\\  \\  /   |  |_ `,
        `/    ^   /\\  \\_/   \\/    ^   /`,
        `\\____   |  \\_____  /\\____   | `,
        `     |__|        \\/      |__|   `,
        ``,
        `The page you requested doesn't exist.`,
        ``,
        `Or who knows? We have a cool game here. Enjoy!`,
        `If you manage to decipher this message, tag @encse on twitter.`,
    ];

    let seed = 1;
    const random = () => {
        let x = Math.sin(seed++) * 10000;
        x = x - Math.floor(x);
        return Math.floor(x * 3);
    };

    let res = '';
    for (const line of lines) {
        res += '<c>';
        for (const ch of line) {
            const disk = [state.smallDisk, state.mediumDisk, state.largeDisk][random()];
            if (disk.location === 'center stick') {
                res += colorize(ch, disk.color);
            } else {
                res += ' ';
            }
        }
        res += '</c>\n';
    }
    return res;
}
