import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

type StickState = "not found" | "has" | "used"
type StickName = "stick-1" | "stick-2" | "stick-3"
type DiskName = 'small-disk' | 'medium-disk' | 'large-disk';

type State = {
    won: boolean;
    matches: "has" | "used";
    smallDisk: StickName
    mediumDisk: StickName;
    largeDisk: StickName;
    stick: StickState;
    holeFound: boolean;
}

type Item = 'pocket' | 'matches' | 'room' | 'stick' | 'installation' | 'disk' | 'disks' | DiskName | 'darkness' | 'wall';
type Verb = 'look' | 'examine' | 'use' | 'move' | 'help';

function ask(prompt: string): Promise<string> {
    return new Promise<string>(resolve => {
        // rl.question(prompt, (input: string) => resolve(input));
    });
}

function assertNever(n: never): never {
    throw new Error(n)
}

function color(state: State): string {
    const r = getStickPosition('small-disk', state) == 'stick-2';
    const g = getStickPosition('medium-disk', state) == 'stick-2';
    const b = getStickPosition('large-disk', state) == 'stick-2';

    if (r && g && b) { return "white" }
    else if (r && g && !b) { return "yellow"; }
    else if (r && !g && b) { return "purple"; }
    else if (r && !g && !b) { return "red"; }
    else if (!r && g && b) { return "cyan"; }
    else if (!r && g && !b) { return "green"; }
    else if (!r && !g && b) { return "blue"; }
    else if (!r && !g && !b) { return "black"; }
    else {
        throw new Error();
    }
}

function describeInstallation(state: State): string {
    if (state.stick == 'used') {
        return 'a tower of Hanoi';
    } else {
        return 'a weird installation'
    }
}

function describeWall(state: State): string {
    if (color(state) == 'black') {
        return '';
    }

    let st = state.smallDisk == 'stick-2' ? '4' : '.';
    st += state.mediumDisk == 'stick-2' ? '0' : '.';
    st += state.largeDisk == 'stick-2' ? '4' : '.';

    return `Somebody painted ${st} on the wall.`
}

function diskColor(diskName: DiskName): string {
    return (
        diskName == 'large-disk' ? 'blue' :
            diskName == 'medium-disk' ? 'green' :
                diskName == 'small-disk' ? 'red' :
                    assertNever(diskName)
    );
}

function getStickPosition(diskName: DiskName, state: State) {
    return (
        diskName == 'large-disk' ? state.largeDisk :
            diskName == 'medium-disk' ? state.mediumDisk :
                diskName == 'small-disk' ? state.smallDisk :
                    assertNever(diskName)
    );
}

function setStickPosition(diskName: DiskName, stick: StickName): Partial<State> {
    return (
        diskName == 'large-disk' ? { largeDisk: stick } :
            diskName == 'medium-disk' ? { mediumDisk: stick } :
                diskName == 'small-disk' ? { smallDisk: stick } :
                    assertNever(diskName)
    );
}

function hanoi(state: State): string {
    let res = [
        '                                '.split(''),
        '                                '.split(''),
        '                                '.split(''),
        '                                '.split(''),
        '=============================='.split(''),
    ];

    const empty = '    |    ';
    const stSmallDisk = '  [***]  ';
    const stMediumDisk = ' [*****] ';
    const stLargeDisk = '[*******]';

    const rowByStick = {
        'stick-1': 3,
        'stick-2': 3,
        'stick-3': 3
    }

    const colByStick = {
        'stick-1': 2,
        'stick-2': 11,
        'stick-3': 21
    }

    const draw = (st: string, col: number, row: number) => {
        let i = 0;
        for (let ch of st) {
            res[row][col + i] = ch
            i++;
        }
    }

    for (let row = 0; row < res.length - 1; row++) {
        for (let col of Object.values(colByStick)) {
            if (state.stick !== 'used' && col === colByStick['stick-3']) {
                continue;
            }
            draw(empty, col, row);
        }
    }

    draw(stLargeDisk, colByStick[state.largeDisk], rowByStick[state.largeDisk]--);
    draw(stMediumDisk, colByStick[state.mediumDisk], rowByStick[state.mediumDisk]--);
    draw(stSmallDisk, colByStick[state.smallDisk], rowByStick[state.smallDisk]--);

    return '\n' + res.map(line => line.join('')).join('\n')
}

function allowedPositions(diskName: DiskName, state: State): StickName[] {
    let targetLocations: StickName[] = state.stick == 'used' ? ['stick-1', 'stick-2', 'stick-3'] : ['stick-1', 'stick-2'];

    if (diskName == 'small-disk') {
        targetLocations = targetLocations.filter(x => x != state.smallDisk);
    } else if (diskName == 'medium-disk' && state.smallDisk == state.mediumDisk) {
        targetLocations = [];
    } else if (diskName == 'medium-disk') {
        targetLocations = targetLocations.filter(x => x != state.smallDisk && x != state.mediumDisk);
    } else if (diskName == 'large-disk' && state.largeDisk == state.mediumDisk) {
        targetLocations = [];
    } else if (diskName == 'large-disk' && state.largeDisk == state.smallDisk) {
        targetLocations = [];
    } else if (diskName == 'large-disk') {
        targetLocations = targetLocations.filter(x => x != state.smallDisk && x != state.mediumDisk && x != state.largeDisk);
    }

    return targetLocations
}

function diskUsage(diskName: DiskName, state: State): string {
    const targetLocations = allowedPositions(diskName, state)
    if (targetLocations.length == 0) {
        return 'I cannot move it.';
    } else if (targetLocations.length == 1) {
        return `I can move it to ${targetLocations[0]}`;
    } else {
        return `I can move it to ${targetLocations.slice(0, targetLocations.length - 1).join(', ')} or ${targetLocations[targetLocations.length - 1]}`;
    }
}

function step(st: string, state: State): [string | string[], Partial<State>] {

    let parts = st
        .replace(/small disk/g, 'small-disk')
        .replace(/large disk/g, 'large-disk')
        .replace(/medium disk/g, 'medium-disk')
        .replace(/stick 1/g, 'stick-1')
        .replace(/stick 2/g, 'stick-2')
        .replace(/stick 3/g, 'stick-3')
        .replace(/ to /g, ' ')
        .trim()
        .split(' ');

    const verb = parts[0] as Verb;
    const obj = parts[1] as Item;
    const toStick = parts[2] as StickName;

    try {
        switch (verb) {
            case 'help':
                return ["Look around, examine things and use them.", {}]
            case 'look':
            case 'examine':
                if (obj == null) {
                    if (color(state) !== 'black') {
                        return step('look room', state);
                    }
                    else {
                        switch (state.matches) {
                            case 'has': return ["I don't see anything. I have a box of matches in my pocket.", state];
                            case 'used': return ["I don't see anything.", state];
                            default: assertNever(state.matches);
                        }
                    }
                }

                if (verb == 'look' && color(state) == 'black') {
                    return [`I don't see anything. I can still examine things with my hands.`, state];
                }

                switch (obj) {
                    case 'wall':
                        if (color(state) == 'black') {
                            return [`It's a wall.`, {}];
                        } else {
                            return [describeWall(state), {}];
                        }
                    case 'darkness':
                        if (color(state) == 'black') {
                            return [`It's pitch dark. I wish I had a brass lantern.`, {}];
                        } else {
                            return [`The room is lit by ${color(state)} colors`, {}];
                        }
                    case 'disk':
                    case 'disks':
                        return ["There is a small disk, a medium disk and a large disk.", {}];
                    case 'small-disk':
                    case 'medium-disk':
                    case 'large-disk':
                        if (getStickPosition(obj, state) == 'stick-2') {
                            return [`The disk glows in ${diskColor(obj)}.`, {}];
                        } else {
                            return [`It's a glass disk.`, {}]
                        }

                    case 'installation':
                        if (state.stick == 'used') {
                            return [[`It's a tower of Hanoi game with three disks.\n` + hanoi(state)], {}];
                        } else {
                            return [['It consists of three disks on two sticks. There is a hole for a third stick to the right.', hanoi(state)], { holeFound: true }]
                        }
                    case 'stick':
                        switch (state.stick) {
                            case 'not found': throw new Error();
                            case 'has': return ["It's a wooden stick, about two spans long.", state];
                            case 'used': return ["The stick is the missing part of a tower of Hanoi game in the middle of the room.", state];
                            default: assertNever(state.stick);
                        }
                        break;
                    case 'matches':
                        switch (state.matches) {
                            case 'has': return ["The box is almost empty, I have just a single match left.", state];
                            case 'used': return ["The box is empty.", state];
                            default: assertNever(state.matches);
                        }
                        break;
                    case 'pocket': {
                        const stMatches =
                            state.matches == 'has' ? 'I have a box of matches.' :
                                state.matches == 'used' ? 'I have an empty box of matches.' :
                                    assertNever(state.matches);

                        const stStick =
                            state.stick == 'has' ? 'I have a wooden stick.' :
                                state.stick == 'used' ? '' :
                                    state.stick == 'not found' ? '' :
                                        assertNever(state.stick);

                        return [[stMatches, stStick], state];
                    }
                    case 'room': {
                        let stRoom = '';
                        let stInstallation = '';
                        let stWall = '';
                        let stStick = '';

                        if (color(state) != 'black') {
                            stRoom = `The room is lit by ${color(state)} colors.`;
                            stInstallation = `There is ${describeInstallation(state)} in the center.`;
                            stWall = describeWall(state)
                        } else {
                            stRoom =
                                "I go down to all fours and start groping around the room. " +
                                "The floor feels cold, probably marble.";
                        }

                        if (state.stick === 'not found') {
                            stStick = 'I have found a stick on the floor.'
                            state = { ...state, stick: "has" };
                        }

                        return [[stRoom, stInstallation, stWall, stStick], state];
                    }
                    default:
                        assertNever(obj);
                }
                break;
            case 'move':
                switch (obj) {
                    case 'disk':
                    case 'disks':
                        return step('use ' + obj, state);
                    case 'small-disk':
                    case 'medium-disk':
                    case 'large-disk':
                        const fromStick = getStickPosition(obj, state);

                        if (allowedPositions(obj, state).includes(toStick)) {
                            state = { ...state, ...setStickPosition(obj, toStick) };

                            const stMove = `I carefully lift the disk and place it on ${toStick}.`;
                            const stAction =
                                fromStick == 'stick-2' ? `As soon as I lift the disk, it stops glowing.` :
                                    toStick == 'stick-2' ? `The disk starts glowing in ${diskColor(obj)} illuminating the room. ${describeWall(state)}` :
                                        '';

                            return [[stMove, stAction, hanoi(state)], state];
                        } else if (toStick == undefined) {
                            return [diskUsage(obj, state), state];
                        } else {
                            return [[`That doesn't work.`, diskUsage(obj, state)], state];
                        }
                    case 'pocket':
                    case 'matches':
                    case 'room':
                    case 'stick':
                    case 'installation':
                    case 'wall':
                    case 'darkness':
                        break;
                    default:
                        assertNever(obj);
                }
                break;
            case 'use':
                switch (obj) {
                    case undefined:
                        return ["What do you want to use?", state];
                    case 'wall':
                        return ["It's of no use.", {}];
                    case 'darkness':
                        return ["Luke, I'm your father...", {}];
                    case 'disk':
                        return ["Which one? There is a small disk, a medium disk and a large disk.", state];
                    case 'disks':
                        return [`I can move the disks between the sticks one by one.`, {}];
                    case 'small-disk':
                    case 'medium-disk':
                    case 'large-disk':
                        return [diskUsage(obj, state), state];

                    case 'matches':

                        switch (state.matches) {
                            case 'has':
                                state = { ...state, matches: "used" }
                                let stMsg = '';
                                if (color(state) !== 'black') {
                                    stMsg = `I lit my last match, but drop it on the floor accidentally.`
                                } else {
                                    stMsg =
                                        `Light illuminates the place for a moment. ` +
                                        `There is ${describeInstallation(state)} in front of me. ` +
                                        `The flare goes out quickly. It's dark again.`;
                                }

                                return [stMsg, state];
                            case 'used':
                                return ["I have ran out of matches", state];
                            default:
                                assertNever(state.matches);
                        }
                        break
                    case 'installation':
                        return step('examine installation', state);
                    case 'stick':
                        if (state.holeFound && state.stick === "has") {
                            return [`I insert the stick to the hole in the installation. It's starting to make sense now.`, { stick: "used" }]
                        } else {
                            return [`Lumos! .... nothing happens`, {}];
                        }
                    case 'pocket':
                        return step('examine pocket', state);
                    case 'room':
                        return step('examine room', state);
                    default:
                        assertNever(obj);
                }
                break;
            default:
                assertNever(verb);
        }
    } catch (e) {
        // console.error(e);
    }
    return ["I don't understand", state];

}

export function main(element: HTMLElement) {
    let state: State = {
        won: false,
        matches: "has",
        stick: "not found",
        holeFound: false,
        largeDisk: "stick-1",
        mediumDisk: "stick-1",
        smallDisk: "stick-1",
    };

    let term = new Terminal();
    term.open(element);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddon.fit();

    term.writeln(`- Ouch that hurt! What's this darkness? Where is everyone?`);
    term.write('> ');
    let command = '';
    term.onData(e => {
        switch (e) {
          case '\r': // Enter
            term.writeln('\n');
            let res = step(command, state);
            state = { ...state, ...res[1] };
            let msg = Array.isArray(res[0]) ? res[0].filter(x => x !== '').join(' ') : res[0];
            msg = msg.trim();
            msg = msg.replaceAll('\n', '\r\n');
            term.writeln(msg);
            command = '';
            term.write('> ');
            break;
          case '\u007F': // Backspace (DEL)
            if (command.length > 0) {
                term.write('\b \b');
                command = command.substring(0, command.length - 1);
            }
            break;
          default: // Print all other characters for demo
            if ((e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E)) || e >= '\u00a0') {
              command += e;
              term.write(e);
            }
        }
      });
}