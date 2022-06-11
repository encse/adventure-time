import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

type State = {
    matches: Item & {used: boolean};
    darkness: Item;
    installation: Item;
    hole: Item;

    sticks: Item;
    leftStick: Item;
    middleStick: Item;
    rightStick: Item;

    missingStick: Item;

    disks: Item;
    smallDisk: Disk;
    mediumDisk: Disk;
    largeDisk: Disk;

    room: Item;
}

type Disk = Item & {stick: 'leftStick' | 'middleStick' | 'rightStick'};
type Result = string | [string | string[], Partial<State>];

function a(st: string) {
    return 'a ' + st;
}

type ItemProps = {
    readonly name: string | string[], 
    readonly access? : 'available' | 'not found' | 'consumed', 
    readonly examine?: string | ((state: State) => Result), 
    readonly look?: string | ((state: State) => Result), 
    readonly use?: (state: State) => Result, 
    readonly parent?: Item
};

type Item = {
    name: string; 
    access: 'available' | 'not found' | 'consumed'; 
    alias: string[];
    examine: (state: State) => Result; 
    look: (state: State) => Result; 
    use: (state: State) => Result;
    parent: Item | null;
}

function getItemByName(state: State, name: string): Item | null {
    for (let item of Object.values(state)){
        if (item.access === 'available' && item.alias.includes(name)){
            return item;
        }
    }
    return null;
}

function makeItem(props: ItemProps) : Item {
    const name  = typeof(props.name) == 'string' ? props.name : props.name[0];
    const examine = 
        props.examine == null ? () => `It's just ${a(name)}` :
        typeof(props.examine) == 'string' ? () => props.examine as string :
        props.examine;
    console.log(name, props.look);
    const look = 
        props.look == null ? (state: State) => {
            if (color(state) === 'black') { 
                return `You don't see anything, try to examine things with your hands.`;
            } else {
                return examine(state);
            }
        }:
        typeof(props.look) == 'string' ? () => props.look as string :
        props.look;

    return {
        name: name,
        access: props.access ?? 'available',
        alias: typeof(props.name) == 'string' ? [name] : props.name,
        examine: examine,
        look: look,
        use: props.use != null ? props.use : () => `You don't know how to use it.`,
        parent: props.parent ?? null,
   };
}

function lumos(state: State) : string {
    if (color(state) !== 'black') {
        return `There is enough light here.`
    } else if (state.missingStick.access === 'available') {
        return (
            `You start swinging the stick drawing magic runes in the air.\n`+
            `- Lumos! - You shout in the darkness.\n` +
            `Nothing happens. Magic have left this place a long time ago.`
        )
    } else {
        return "You don't have a magic wand."
    }
}

function step(st: string, state: State): Result {
    let verb = st.trim().split(' ')[0];
    let obj = st.trim().split(' ').slice(1).join(' ');

    switch (verb) {
        case 'hello':
            return "- Hello! ... no answer";
        case 'lumos': 
            return lumos(state);
        case 'help':
            return "Look around, examine things and try to use them.";
        case 'look':
        case 'examine':
            if (obj === '') {
                return state.room[verb](state);
            } else {
                const item = getItemByName(state, obj);
                if (item != null) {
                    return item[verb](state)
                }
            }
            break;
        case 'use':
            if (obj === '') {
                return `What do you want to use?`;
            } else {
                const item = getItemByName(state, obj);
                if (item != null) {
                    return item.use(state);
                } else {
                    return `You don't have it.`;
                }
            }
    }
    return "I don't understand.";
}


export function main(element: HTMLElement) {
    const room = makeItem({
        name: 'room',
        look: (state:State): Result => 
            color(state) !== 'black' ? state.room.examine(state) :
            !state.matches.used      ? `You don't see anything, but you have a box of matches in your pocket.` :
                                       `You don't see anything.`,
        examine: (state: State): Result =>  {
            let stRoom = '';
            let stInstallation = '';
            // let stWall = '';
            let stStick = '';

            let upd: Partial<State> = {};

            if (color(state) !== 'black') {
                stRoom = `The room is lit by ${color(state)} colors. `;
                stInstallation = `There is ${state.installation.name} in the center. `;
                // stWall = describeWall(state)
            } else {
                stRoom =
                    "You go down to all fours and start groping around the room. " +
                    "The floor feels cold, probably marble. ";
            }

            if (state.missingStick.access === 'not found') {
                stStick = 'You have found a stick on the floor. ';
                upd = {missingStick: {...state.missingStick, access: 'available'}}
            }

            const msg = stRoom + stInstallation + stStick
            return [msg, upd];
        }
    });

    const darkness = makeItem({
            name:    'darkness', 
            examine: () => 
                color(state) === 'black' ? 
                `It's pitch dark. You wish you had a brass lantern.` :
                `The room is lit by ${color(state)} colors`,
            look:    (state) => state.darkness.examine(state),
            use:     () => `Luke, I am your father`,
        });

    const matches = {
        used: false,
        ...makeItem({
            name: ['matches', 'match', 'box of matches'],
            examine: (state) => 
                state.matches.used ?
                    `The box is empty`:
                    `You have just a single match left.`,
            use: (state: State) =>  {
                if (state.matches.used) {
                    return `You have ran out of matches.`
                } else {
                    const msg =  
                        color(state) !== 'black' ? `You lit your last match, but drop it on the floor accidentally.` :
                                                   `Light illuminates the place for a moment. ` +
                                                   `There is ${a(installation.name)} in front of you. ` +
                                                   `The flare goes out quickly. It's dark again.`;
                    const upd : Partial<State> = {
                        installation: {...installation, access: 'available'},
                        matches: {...state.matches, used: true},
                    };
                    return [msg, upd];
                }
            }
        })
    };

    const installation = makeItem({
        name: ['weird installation', 'installation'],
        access: 'not found',
        examine: (state: State): Result => {

            const msg = state.rightStick.access === 'available' ?
                `It's a tower of Hanoi game with three disks.` :
                `The installation consists of three disks on two sticks. There is a hole for a third stick to the right.`;

            const upd: Partial<State> = {
                hole:        {...hole, access: 'available'},

                sticks:      {...sticks,  access: 'available'},
                leftStick:   {...leftStick,  access: 'available'},
                middleStick: {...middleStick,  access: 'available'},
                
                disks:       {...disks,  access: 'available'},
                smallDisk:   {...smallDisk,  access: 'available'},
                mediumDisk:  {...mediumDisk,  access: 'available'},
                largeDisk:   {...largeDisk,  access: 'available'},
            };
            return [msg + hanoi(state), upd];
        }
    });
   
    const hole =  makeItem({
        name: 'hole',
        access: 'not found',
        examine: () => `It's a small hole in the table. Perfect for a third stick.`
    });

    const leftStick = makeItem({
        name: 'left stick',
        access: 'not found',
        examine: () => `It's made of wood, about two spans long.`
    });

    const middleStick = makeItem({
        name: 'middle stick',
        access: 'not found',
        examine: () => `It's made of wood, about two spans long.`
    });

    const rightStick = makeItem({
        name: 'right stick',
        access: 'not found',
        examine: () => `It's made of wood, about two spans long.`
    });

    const missingStick = makeItem({
        name: 'stick',
        access: 'not found',
        examine: () => {
            if (state.hole.access === 'available') {
                return `The stick would fit into the hole in the installation.`
            } else {
                return `It's made of wood, about two spans long.`;
            }
        },
        use: (state) => {
            if (state.hole.access === 'available') {
                const msg = `You insert the stick to the hole in the installation. It's starting to make sense now.`;
                const upd: Partial<State> = {
                    missingStick: {...state.missingStick, access: 'consumed' },
                    rightStick: {...state.rightStick, access: 'available' }
                } 
                return [msg, upd];
            } else {
                return lumos(state);
            }
        }
    });

    const sticks = makeItem({
        name: 'sticks',
        access: 'not found',
        examine: (state) => {
            if (state.rightStick.access === 'available') {
                return `There is a ${state.leftStick.name} a ${state.middleStick.name} and a ${state.rightStick.name}.`
            } else {
                return `There is a ${state.leftStick.name} a ${state.middleStick.name}.`
            }
        }
    });

    const smallDisk:Disk = {
        stick: 'leftStick',
        ...makeItem({
            access: 'not found',
            name: 'small disk',
        })
    };

    const mediumDisk:Disk = {
        stick: 'leftStick',
        ...makeItem({
            access: 'not found',
            name: 'medium disk',
        })
    };

    const largeDisk:Disk = {
        stick: 'leftStick',
        ...makeItem({
            access: 'not found',
            name: 'large disk',
        })
    };

    const disks = makeItem({
        name: 'disks',
        access: 'not found',
        examine: (state) => {
            return `There is a ${state.smallDisk.name}, a ${state.mediumDisk.name} and a ${state.largeDisk.name}.`
        }
    });

    let state: State = {
        installation,
        hole,
        leftStick,
        middleStick,
        rightStick,
        missingStick: missingStick,
        sticks,
        matches: matches,
        darkness: darkness,
        room: room,
        smallDisk,
        mediumDisk,
        largeDisk,
        disks,
    };

    let term = new Terminal();
    term.open(element);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitAddon.fit();

    term.writeln(`- Ouch that hurt! What's this darkness? Where is everyone?`);
    term.write('\n> ');
    let command = '';
    term.onData(e => {
        switch (e) {
          case '\r': // Enter
            term.writeln('\r');
            let res = step(command, state);
            let msg = ''
            if (typeof(res) == 'string'){
                msg = res;
            } else {
                state = { ...state, ...res[1] };
                msg = Array.isArray(res[0]) ? res[0].filter(x => x !== '').join(' ') : res[0];
            }

            msg = msg.trim();
            msg = msg.replaceAll('\n', '\r\n');
            term.writeln(msg);
            command = '';
            term.write('\n> ');
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

// function assertNever(n: never): never {
//     throw new Error(n)
// }

function color(state: State): string {
    return 'black';
    // const r = getStickPosition('small-disk', state) == 'stick-2';
    // const g = getStickPosition('medium-disk', state) == 'stick-2';
    // const b = getStickPosition('large-disk', state) == 'stick-2';

    // if (r && g && b) { return "white" }
    // else if (r && g && !b) { return "yellow"; }
    // else if (r && !g && b) { return "purple"; }
    // else if (r && !g && !b) { return "red"; }
    // else if (!r && g && b) { return "cyan"; }
    // else if (!r && g && !b) { return "green"; }
    // else if (!r && !g && b) { return "blue"; }
    // else if (!r && !g && !b) { return "black"; }
    // else {
    //     throw new Error();
    // }
}



// function describeWall(state: State): string {
//     if (color(state) == 'black') {
//         return '';
//     }

//     let st = state.smallDisk == 'stick-2' ? '4' : '.';
//     st += state.mediumDisk == 'stick-2' ? '0' : '.';
//     st += state.largeDisk == 'stick-2' ? '4' : '.';

//     return `Somebody painted ${st} on the wall.`
// }

// function diskColor(diskName: DiskName): string {
//     return (
//         diskName == 'large-disk' ? 'blue' :
//             diskName == 'medium-disk' ? 'green' :
//                 diskName == 'small-disk' ? 'red' :
//                     assertNever(diskName)
//     );
// }

// function getStickPosition(diskName: DiskName, state: State) {
//     return (
//         diskName == 'large-disk' ? state.largeDisk :
//             diskName == 'medium-disk' ? state.mediumDisk :
//                 diskName == 'small-disk' ? state.smallDisk :
//                     assertNever(diskName)
//     );
// }

// function setStickPosition(diskName: DiskName, stick: StickName): Partial<State> {
//     return (
//         diskName == 'large-disk' ? { largeDisk: stick } :
//             diskName == 'medium-disk' ? { mediumDisk: stick } :
//                 diskName == 'small-disk' ? { smallDisk: stick } :
//                     assertNever(diskName)
//     );
// }

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
        'leftStick': 3,
        'middleStick': 3,
        'rightStick': 3
    }

    const colByStick = {
        'leftStick': 2,
        'middleStick': 11,
        'rightStick': 21
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
            if (state.rightStick.access !== 'available' && col === colByStick['rightStick']) {
                continue;
            }
            draw(empty, col, row);
        }
    }

    draw(stLargeDisk, colByStick[state.largeDisk.stick], rowByStick[state.largeDisk.stick]--);
    draw(stMediumDisk, colByStick[state.mediumDisk.stick], rowByStick[state.mediumDisk.stick]--);
    draw(stSmallDisk, colByStick[state.smallDisk.stick], rowByStick[state.smallDisk.stick]--);

    return '\n' + res.map(line => line.join('')).join('\n')
}

// function allowedPositions(diskName: DiskName, state: State): StickName[] {
//     let targetLocations: StickName[] = state.stick == 'used' ? ['stick-1', 'stick-2', 'stick-3'] : ['stick-1', 'stick-2'];

//     if (diskName == 'small-disk') {
//         targetLocations = targetLocations.filter(x => x != state.smallDisk);
//     } else if (diskName == 'medium-disk' && state.smallDisk == state.mediumDisk) {
//         targetLocations = [];
//     } else if (diskName == 'medium-disk') {
//         targetLocations = targetLocations.filter(x => x != state.smallDisk && x != state.mediumDisk);
//     } else if (diskName == 'large-disk' && state.largeDisk == state.mediumDisk) {
//         targetLocations = [];
//     } else if (diskName == 'large-disk' && state.largeDisk == state.smallDisk) {
//         targetLocations = [];
//     } else if (diskName == 'large-disk') {
//         targetLocations = targetLocations.filter(x => x != state.smallDisk && x != state.mediumDisk && x != state.largeDisk);
//     }

//     return targetLocations
// }

// function diskUsage(diskName: DiskName, state: State): string {
//     const targetLocations = allowedPositions(diskName, state)
//     if (targetLocations.length == 0) {
//         return 'I cannot move it.';
//     } else if (targetLocations.length == 1) {
//         return `I can move it to ${targetLocations[0]}`;
//     } else {
//         return `I can move it to ${targetLocations.slice(0, targetLocations.length - 1).join(', ')} or ${targetLocations[targetLocations.length - 1]}`;
//     }
// }



// function step(st: string, state: State): [string | string[], Partial<State>] {

//         switch (verb) {
//             case 'look':
//             case 'examine':
//                 switch (obj) {
//                     case 'wall':
//                         if (color(state) == 'black') {
//                             return [`It's a wall.`, {}];
//                         } else {
//                             return [describeWall(state), {}];
//                         }
//                     case 'disk':
//                     case 'disks':
//                         return ["There is a small disk, a medium disk and a large disk.", {}];
//                     case 'small-disk':
//                     case 'medium-disk':
//                     case 'large-disk':
//                         if (getStickPosition(obj, state) == 'stick-2') {
//                             return [`The disk glows in ${diskColor(obj)}.`, {}];
//                         } else {
//                             return [`It's a glass disk.`, {}]
//                         }

//                     case 'stick':
//                         switch (state.stick) {
//                             case 'not found': throw new Error();
//                             case 'has': return ["It's a wooden stick, about two spans long.", state];
//                             case 'used': return ["The stick is the missing part of a tower of Hanoi game in the middle of the room.", state];
//                             default: assertNever(state.stick);
//                         }
//                         break;
//                     case 'matches':
//                         switch (state.matches) {
//                             case 'has': return ["The box is almost empty, I have just a single match left.", state];
//                             case 'used': return ["The box is empty.", state];
//                             default: assertNever(state.matches);
//                         }
//                         break;
//                     case 'pocket': {
//                         const stMatches =
//                             state.matches == 'has' ? 'I have a box of matches.' :
//                                 state.matches == 'used' ? 'I have an empty box of matches.' :
//                                     assertNever(state.matches);

//                         const stStick =
//                             state.stick == 'has' ? 'I have a wooden stick.' :
//                                 state.stick == 'used' ? '' :
//                                     state.stick == 'not found' ? '' :
//                                         assertNever(state.stick);

//                         return [[stMatches, stStick], state];
//                     }
//                     case 'room': {
//                         let stRoom = '';
//                         let stInstallation = '';
//                         let stWall = '';
//                         let stStick = '';

//                         if (color(state) != 'black') {
//                             stRoom = `The room is lit by ${color(state)} colors.`;
//                             stInstallation = `There is ${describeInstallation(state)} in the center.`;
//                             stWall = describeWall(state)
//                         } else {
//                             stRoom =
//                                 "I go down to all fours and start groping around the room. " +
//                                 "The floor feels cold, probably marble.";
//                         }

//                         if (state.stick === 'not found') {
//                             stStick = 'I have found a stick on the floor.'
//                             state = { ...state, stick: "has" };
//                         }

//                         return [[stRoom, stInstallation, stWall, stStick], state];
//                     }
//                     default:
//                         assertNever(obj);
//                 }
//                 break;
//             case 'move':
//                 switch (obj) {
//                     case 'disk':
//                     case 'disks':
//                         return step('use ' + obj, state);
//                     case 'small-disk':
//                     case 'medium-disk':
//                     case 'large-disk':
//                         const fromStick = getStickPosition(obj, state);

//                         if (allowedPositions(obj, state).includes(toStick)) {
//                             state = { ...state, ...setStickPosition(obj, toStick) };

//                             const stMove = `I carefully lift the disk and place it on ${toStick}.`;
//                             const stAction =
//                                 fromStick == 'stick-2' ? `As soon as I lift the disk, it stops glowing.` :
//                                     toStick == 'stick-2' ? `The disk starts glowing in ${diskColor(obj)} illuminating the room. ${describeWall(state)}` :
//                                         '';

//                             return [[stMove, stAction, hanoi(state)], state];
//                         } else if (toStick == undefined) {
//                             return [diskUsage(obj, state), state];
//                         } else {
//                             return [[`That doesn't work.`, diskUsage(obj, state)], state];
//                         }
//                     case 'pocket':
//                     case 'matches':
//                     case 'room':
//                     case 'stick':
//                     case 'installation':
//                     case 'wall':
//                     case 'darkness':
//                         break;
//                     default:
//                         assertNever(obj);
//                 }
//                 break;
//             case 'use':
//                 switch (obj) {
//                     case undefined:
//                         return ["What do you want to use?", state];
//                     case 'wall':
//                         return ["It's of no use.", {}];
//                     case 'darkness':
//                         return ["Luke, I'm your father...", {}];
//                     case 'disk':
//                         return ["Which one? There is a small disk, a medium disk and a large disk.", state];
//                     case 'disks':
//                         return [`I can move the disks between the sticks one by one.`, {}];
//                     case 'small-disk':
//                     case 'medium-disk':
//                     case 'large-disk':
//                         return [diskUsage(obj, state), state];

//                     case 'matches':

//                         switch (state.matches) {
//                             case 'has':
//                                 state = { ...state, matches: "used" }
//                                 let stMsg = '';
//                                 if (color(state) !== 'black') {
//                                     stMsg = `I lit my last match, but drop it on the floor accidentally.`
//                                 } else {
//                                     stMsg =
//                                         `Light illuminates the place for a moment. ` +
//                                         `There is ${describeInstallation(state)} in front of you. ` +
//                                         `The flare goes out quickly. It's dark again.`;
//                                 }

//                                 return [stMsg, state];
//                             case 'used':
//                                 return ["I have ran out of matches", state];
//                             default:
//                                 assertNever(state.matches);
//                         }
//                         break
//                     case 'installation':
//                         return step('examine installation', state);
//                     case 'stick':

//                     case 'pocket':
//                         return step('examine pocket', state);
//                     case 'room':
//                         return step('examine room', state);
//                     default:
//                         assertNever(obj);
//                 }
//                 break;
//             default:
//                 assertNever(verb);
//         }
//     } catch (e) {
//         // console.error(e);
//     }
//     return ["I don't understand", state];

// }
