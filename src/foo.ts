import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

type State = {
    matches: Item & {used: boolean};
    darkness: Item;
    installation: Item;
    hole: Item;

    leftStick: Item;
    middleStick: Item;
    missingStick: Item & {used: boolean};

    smallDisk: Disk;
    mediumDisk: Disk;
    largeDisk: Disk;

    room: Item;
    wall: Item;
    pocket: Item;
}

type DiskLocation = 'left stick' | 'middle stick' | 'right stick'
type Disk = Item & {location: DiskLocation, color: string};
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

function colorize(st: string, color: string) {
    const c = {
        black: 0, 
        red: 1, 
        green:2,
        yellow: 3, 
        blue: 4,
        magenta: 5,
        cyan: 6,
        white: 7,
    }[color];
    return `\u001b[3${c}m${st}\u001b[0m`;
}

function describeWall(state: State): string {

    const message = [
        `                                                                   `,
        `                                                                   `,
        `                      _____  _______      _____                    `,
        `                     /  |  | \\   _  \\    /  |  |                 `,
        `                    /   |  |_/  /_\\  \\  /   |  |_                `,
        `                   /    ^   /\\  \\_/   \\/    ^   /               `,
        `                   \\____   |  \\_____  /\\____   |                `,
        `                        |__|        \\/      |__|                  `,
        `                                                                   `,
        `                  The page you requested doesn't exist.            `,
        `                                                                   `,
        `           Or who knows? We have a cool game here. Enjoy!          `,
        `    If you manage to decipher this message, tag @encse on twitter. `,
        `                                                                   `,
    ].join('\n');

    let seed = 1;
    const random = () => {
        let x = Math.sin(seed++) * 10000;
        x =  x - Math.floor(x);
        return Math.floor(x * 3);
    }
    
    let res = '';
    for (let ch of message) {
        const disk = [state.smallDisk, state.mediumDisk, state.largeDisk][random()];
        if (ch === '\n') {
            res += '\n';
        } else if (disk.location === 'middle stick') {
            res += colorize(ch, disk.color)
        } else {
            res += ' ';
        }
    } 
    return res;
}


function fullName(item: Item) {
    return item.alias[item.alias.length - 1];
}

function disambiguate(items: Item[]) {
    let msg = `Which one do you want?\n`;
    let list = items.map(item => `- ` + item.alias[item.alias.length - 1]).join('\n');
    return msg + list + '\n';
}

function getItemsByName(state: State, name: string): Item[] {
    return Object.values(state).filter(item => item.access === 'available' && item.alias.includes(name));
}

function makeItem(props: ItemProps) : Item {
    const name  = typeof(props.name) == 'string' ? props.name : props.name[0];
    const examine = 
        props.examine == null ? () => `It's just ${a(name)}` :
        typeof(props.examine) == 'string' ? () => props.examine as string :
        props.examine;

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
    } else if (state.missingStick.access === 'available' && !state.missingStick.used) {
        return (
            `You start swinging the stick drawing magic runes in the air.\n`+
            `- Lumos! - You shout in the darkness.\n` +
            `Nothing happens. Magic left this place long time ago.`
        )
    } else {
        return "You don't have a magic wand."
    }
}

function step(st: string, state: State): Result {
    let verb = st.trim().split(' ')[0];
    let obj = st.trim().split(' ').slice(1).join(' ');

    if (verb === 'l') {  verb = 'look'; }
    if (verb === 'h') {  verb = 'help'; }
    if (verb === 'i') {  verb = 'inventory'; }
    if (verb === 'inv') {  verb = 'inventory'; }
    if (verb === 'e') {  verb = 'examine'; }
    if (verb === 'u') {  verb = 'use'; }
    if (verb === 'm') {  verb = 'move'; }

    switch (verb) {
        case 'hello':
            return "- Hello!\n...\nNo answer. Not sure if this is a bad thing though.";
        case 'lumos': 
            return lumos(state);
        case 'inventory': 
            return step('examine pocket', state);
        case 'help':
            return "Look around, examine things and try to use them.";
        case 'look':
        case 'examine':
            if (obj === '') {
                return state.room[verb](state);
            } else {
                const items = getItemsByName(state, obj);
                if (items.length === 1) {
                    return items[0][verb](state)
                } else if (items.length > 1) {
                    return disambiguate(items);
                } else {
                    return `You don't have it.`;
                }
            }
        case 'use':
            if (obj === '') {
                return `What do you want to use?`;
            } else {
                const items = getItemsByName(state, obj);
                if (items.length === 1 ) {
                    return items[0].use(state);
                } else if (items.length > 1){
                    return disambiguate(items);
                } else {
                    return `You don't have it.`;
                }
            }
        case 'move': {
            if (obj.indexOf(' to ') < 0) {
                return 'Try "move X to Y".';
            } else {
                const parts = obj.split(' to ');
                const what = parts[0].trim();
                const where = parts[1].trim();
               
                const objAs = getItemsByName(state, what);
                const objBs = getItemsByName(state, where);

                if (objAs.length === 0 || objBs.length === 0) {
                    return `That doesn't work.`
                } else if (objAs.length > 1) {
                    return disambiguate(objAs);
                } else if (objBs.length > 1) {
                    return disambiguate(objBs);
                } else {
                    const disk = objAs[0] as Disk;
                    const toStick = objBs[0];

                    if (disk.name !== 'disk') {
                        return `That doesn't work.`
                    } 

                    if (toStick.name !== 'stick') {
                        return diskUsage(disk, state);
                    }

                    const fromStick = getItemsByName(state, disk.location)[0];
                    
                    if (allowedPositions(disk, state).includes(toStick)) {
                        const upd: Partial<State> = 
                            disk === state.smallDisk ?  {smallDisk: {...state.smallDisk, location: fullName(toStick) as DiskLocation}} :
                            disk === state.mediumDisk ? {mediumDisk: {...state.mediumDisk, location: fullName(toStick) as DiskLocation}} :
                                                        {largeDisk: {...state.largeDisk, location: fullName(toStick) as DiskLocation}};

                        const stMove = `You carefully lift the disk and place it on the ${fullName(toStick)}.`;
                        const stAction =
                            fromStick === state.middleStick ? `As soon as you lift the disk, it stops glowing.` :
                            toStick === state.middleStick ? `The disk starts glowing in ${disk.color} illuminating the room.` :
                            '';

                        state = {...state, ...upd};
                        return [[stMove, stAction, hanoi(state)], state];
                    }  else {
                        return `That doesn't work. ` +  diskUsage(disk, state);
                    }
                }
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
            let stWall = '';
            let stStick = '';

            let upd: Partial<State> = {};

            if (color(state) !== 'black') {
                stRoom = `The room is lit by ${color(state)} colors. `;
                stInstallation = `There is ${state.installation.name} in the center. `;
                stWall = `There is some message on the wall. `
            } else {
                stRoom =
                    "You go down to all fours and start groping around the room. " +
                    "The floor feels cold, probably marble. ";
            }

            if (state.missingStick.access === 'not found') {
                stStick = 'You have found a stick on the floor. ';
                upd = {missingStick: {...state.missingStick, access: 'available'}}
            }

            const msg = stRoom + stInstallation + stWall + stStick;
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

            const msg = state.missingStick.used ?
                `It's a tower of Hanoi game with a small, a medium and a large disk.` :
                `The installation consists of a small, a medium and a large disk on two sticks. There is a hole for a third stick to the right.`;

            const upd: Partial<State> = {
                hole:        {...state.hole, access: 'available'},

                leftStick:   {...state.leftStick,  access: 'available'},
                middleStick: {...state.middleStick,  access: 'available'},
                
                smallDisk:   {...state.smallDisk,  access: 'available'},
                mediumDisk:  {...state.mediumDisk,  access: 'available'},
                largeDisk:   {...state.largeDisk,  access: 'available'},
            };
            return [msg + hanoi(state), upd];
        }
    });
   
    const hole =  makeItem({
        name: 'hole',
        access: 'not found',
        examine: () => `A third stick would fit perfectly there.`
    });

    const leftStick = makeItem({
        name: ['stick', 'sticks', 'left stick'],
        access: 'not found',
        examine: () => `It's made of wood, about two spans long.`
    });

    const middleStick = makeItem({
        name: ['stick', 'sticks', 'sticks','middle stick'],
        access: 'not found',
        examine: () => `It's made of wood, about two spans long.`
    });

    const missingStick ={
        used: false, 
        ...makeItem({
            name: ['stick', 'sticks', 'stick from the floor'],
            access: 'not found',
            examine: () => {
                if (state.missingStick.used) {
                    return `The stick is stuck.`;
                } else if (state.hole.access === 'available') {
                    return `The stick would fit into the hole in the installation.`
                } else {
                    return `It's made of wood, about two spans long.`;
                }
            },
            use: (state) => {
                if (state.missingStick.used) {
                    return `The stick is stuck.`;
                } else if (state.hole.access === 'available') {
                    const msg = `You insert the stick to the hole in the installation. It's starting to make sense now.`;
                    const upd: Partial<State> = {
                        missingStick: {...state.missingStick, alias: ['stick', 'right stick'], used: true}
                    } 
                    return [msg, upd];
                } else {
                    return lumos(state);
                }
            }
        })
    };

    const makeDisk = (shortName: string, color: string): Disk => {
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
                    } else if (self.location === 'middle stick') {
                        return `It's made of glass and glowing in ${self.color}, illuminating the room.`;
                    } else {
                        return `It's made of glass.`;
                    }
                },
                use: () => `You can try to move it to an other stick.`
            })
        };
    }
    const smallDisk = makeDisk('small', 'red');
    const mediumDisk = makeDisk('medium', 'green');
    const largeDisk = makeDisk('large', 'blue');

    const wall = makeItem({
        name: 'wall', 
        examine: (state) => {

            if (color(state) === 'black') {
                return `It's a wall, made of concrete.`;
            }
            return `Somebody painted a message on the wall. It says:` + describeWall(state);
        }
    });

    const pocket = makeItem({
        name: 'pocket', 
        examine: (state) => {
            let st = ``;
            if (state.matches.access === 'available') {
                st += `You have a box of matches.`;
            } 

            if (state.missingStick.access === 'available' && !state.missingStick.used) {
                st += `You have a stick.`;
            }

            return st;
        }
    });

    let state: State = {
        installation,
        hole,
        leftStick,
        middleStick,
        missingStick,
        matches,
        darkness,
        room,
        smallDisk,
        mediumDisk,
        largeDisk,
        wall,
        pocket,
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

function color(state: State): string {
    const r = state.smallDisk.location === 'middle stick';
    const g = state.mediumDisk.location === 'middle stick';
    const b = state.largeDisk.location === 'middle stick';

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
        'left stick': 3,
        'middle stick': 3,
        'right stick': 3
    }

    const colByStick = {
        'left stick': 2,
        'middle stick': 11,
        'right stick': 21
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
            if (!state.missingStick.used && col === colByStick['right stick']) {
                continue;
            }
            draw(empty, col, row);
        }
    }

    draw(stLargeDisk, colByStick[state.largeDisk.location], rowByStick[state.largeDisk.location]--);
    draw(stMediumDisk, colByStick[state.mediumDisk.location], rowByStick[state.mediumDisk.location]--);
    draw(stSmallDisk, colByStick[state.smallDisk.location], rowByStick[state.smallDisk.location]--);

    return '\n\n' + res.map(line => '  ' +  line.join('')).join('\n')
}

function allowedPositions(disk: Disk, state: State):  Item[] {
    let targetLocations: string[] = state.missingStick.used ? 
        ['left stick', 'middle stick', 'right stick'] : 
        ['left stick', 'middle stick'];

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

    return targetLocations.map(location => getItemsByName(state, location)[0]);
}

function diskUsage(disk: Disk, state: State): string {
    const targetItems = allowedPositions(disk, state).map(item => fullName(item));
    if (targetItems.length === 0) {
        return 'You cannot move it.';
    } else if (targetItems.length === 1) {
        return `You can move it to ${targetItems[0]}`;
    } else {
        return `You can move it to ${targetItems.slice(0, targetItems.length - 1).join(', ')} or ${targetItems[targetItems.length - 1]}`;
    }
}