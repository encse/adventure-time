import c from 'ansi-colors';

export type Color =
    'black' |
    'red' |
    'green' |
    'yellow' |
    'blue' |
    'magenta' |
    'cyan' |
    'white' |
    'grey';


export function colorize(st: string, color: Color): string {
    return c[color](st);
}
