import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { highlight, lineBreak } from './textUtils';

import c from 'ansi-colors';
c.enabled = true;
type Color = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'grey'
const konami = '\u001b[A\u001b[A\u001b[B\u001b[B\u001b[D\u001b[C\u001b[D\u001b[Cba';
let konamiFound: boolean;
let iddqd: boolean;

type State = {
    matches: Item & {used: boolean};
    darkness: Item;
    installation: Item;
    hole: Item;

    leftStick: Item;
    centerStick: Item;
    missingStick: Item & {used: boolean};

    smallDisk: Disk;
    mediumDisk: Disk;
    largeDisk: Disk;

    room: Item;
    wall: Item;
    pocket: Item;
}

type DiskLocation = 'left stick' | 'center stick' | 'right stick'
type Disk = Item & {location: DiskLocation, color: Color};
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

function colorize(st: string, color: Color): string {
    return c[color](st);
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
        } else if (disk.location === 'center stick') {
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
                return `Try to examine things with your hands instead.`;
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
    if (st === konami) {
        if (!konamiFound) {
            konamiFound = true;
            return 'You have found a secret!';
        } else {
            return 'Cheater!'
        }
    } else if (st === 'iddqd') {
        if (!iddqd) {
            iddqd = true;
            return 'You have found a secret!';
        } else {
            return 'Cheater!'
        }
    }

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
            if (color(state) === 'black') {
                return "Is it a good idea to start making noise in a dark room?\n- Hello!\nNo answer. Not sure if this is a bad thing though.";
            } else {
                return "- Khmm ... hello?\nNobody is here.";
            }
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
            if (getItemsByName(state, 'disk').length === 0) {
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

               
                const objAs = getItemsByName(state, what);
                const objBs = getItemsByName(state, where);
                const disk = objAs[0] as Disk;
                const toStick = objBs[0];

                if (disk == null || disk.name !== 'disk' || toStick == null || toStick.name !== 'stick') {
                    return `Try "move <some> disk to <position>".`
                } else if (objAs.length > 1) {
                    return disambiguate(objAs);
                } else if (objBs.length > 1) {
                    return disambiguate(objBs);
                } else if (toStick === getItemsByName(state, disk.location)[0]) {
                    return `It's already there.`;
                } else if (!isTopDisk(disk, state)) {
                    return `The disks are heavy and you don't want to break them, try moving the disk on the top of the stick first. `;
                } else if (!allowedPositions(disk, state).includes(toStick)) {
                    return `You are not a Feng shui expert, but that disk would not look right there.`;
                } else {
                    const fromStick = getItemsByName(state, disk.location)[0];
                
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
                    return [[stMove, stAction, hanoi(state)], state];
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
            !state.matches.used      ? `You don't see anything, but you have a {{box of matches}} in your {{pocket}}.` :
                                       `Your eyes got used to the darkness already. But apart from the chaotic triggering of your neurons making some fake sparkles you don't see a thing.`,
        examine: (state: State): Result =>  {
            let stRoom = '';
            let stWall = '';
            let stStick = '';

            let upd: Partial<State> = {};

            if (color(state) !== 'black') {
                stRoom = `The dim light of the installation fills the room with ${color(state)} colors. It's much more friendly now. `;
                stWall = `You notice some writing on the {{wall}}. `
            } else {
                stRoom =
                    "You go down to all fours and start groping around the room. " +
                    "The floor feels cold, probably marble. ";
            }

            if (state.missingStick.access === 'not found') {
                stStick = 'You have found a {{stick}} on the floor. ';
                upd = {missingStick: {...state.missingStick, access: 'available'}}
            }

            const msg = stRoom + stWall + stStick;
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
                    `The small box brings back good memories. The Kickstand bar! Those were the days! Unfortunately the box is empty, it has only nostalgic value now. `:
                    `The small box brings back good memories. The Kickstand bar! Those were the days! And it even has a last match, ready for use. `,
            use: (state: State) =>  {
                if (state.matches.used) {
                    return `You have ran out of matches.`
                } else {
                    let msg = '';
                    if (color(state) !== 'black') {
                        msg = `Fwoosh... ouch. You drop your last match to the floor.`;
                    } else {
                        msg = `Fwoosh... sudden light illuminates the place for a moment. ` +
                            `There is {{${a(installation.name)}}} in front of you, ` +
                            `but you don't have time to observe it well. ` +
                            `The fire goes out quickly and you stay alone in the darkness again.`;
                    }
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
                `It's a tower of Hanoi game with a {{small}}, a {{medium}} and a {{large disk}}.` :
                `The installation consists of a {{small}}, a {{medium}} and a {{large disk}} on two {{sticks}}. There is a {{hole}} for a third stick to the right.`;

            const upd: Partial<State> = {
                hole:        {...state.hole, access: 'available'},

                leftStick:   {...state.leftStick,  access: 'available'},
                centerStick: {...state.centerStick,  access: 'available'},
                
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

    const centerStick = makeItem({
        name: ['stick', 'sticks', 'middle stick', 'center stick'],
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
                    return `It's about two spans long. It's some kind of wood, based on its smell, it could be made of Elder.`;
                }
            },
            use: (state) => {
                if (state.missingStick.used) {
                    return `The stick is stuck.`;
                } else if (state.hole.access === 'available') {
                    const msg = `You twist the stick into the hole of the installation like it was some IKEA furniture (an Ünstallation). It fits there perfectly, the whole thing starts to make sense now.`;
                    const upd: Partial<State> = {
                        missingStick: {...state.missingStick, alias: ['stick', 'sticks', 'right stick'], used: true}
                    } 
                    return [msg, upd];
                } else {
                    return lumos(state);
                }
            }
        })
    };

    const makeDisk = (shortName: string, color: Color): Disk => {
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
                st += `You have a box of matches. `;
            } 

            if (state.missingStick.access === 'available' && !state.missingStick.used) {
                st += `You have a stick. `;
            }

            return st;
        },
        use: (sate) => {
            return sate.pocket.examine(state);
        }
    });

    let state: State = {
        installation,
        hole,
        leftStick,
        centerStick,
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
   
    let windowWidth = 80;

    term.onResize(evt => {
        windowWidth = Math.min(80, evt.cols);
    })

    term.writeln(``);
    term.writeln(`                Adventure time!               `);
    term.writeln(`    https://github.com/encse/text-adventure   `);
    term.writeln(``);
    term.writeln(``);
    term.writeln(``);
    term.writeln(highlight(`- Ouch, that hurts! What's this {{darkness}}? Where is everyone?`));
    term.write('\n> ');
    let command = '';
    let buffer = '';

    term.onData(e => {
        buffer += e;
        if (buffer.endsWith(konami)){
            command = konami;
            e = '\r';
        }
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
            msg = highlight(msg);
            term.writeln(lineBreak(msg, windowWidth).replaceAll('\n', '\r\n'));
            command = '';
            buffer = '';
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
    const r = state.smallDisk.location === 'center stick';
    const g = state.mediumDisk.location === 'center stick';
    const b = state.largeDisk.location === 'center stick';

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

    return targetLocations.map(location => getItemsByName(state, location)[0]);
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
