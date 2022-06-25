import 'xterm/css/xterm.css';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {WebLinksAddon} from 'xterm-addon-web-links';
import {center, highlight, lineBreak} from './utils';
import {konamiCode} from '../game/items/secrets';

export interface Io {
    readln(): Promise<string>;
    write(text: string): void;
    writeln(text: string): void;
}

export class XtermIo implements Io {
    windowWidth: number;
    term: Terminal;

    constructor(element: HTMLElement) {
        this.term = new Terminal({
            theme: {
                foreground: '#00ff33',
            },
        });
        this.term.open(element);
        const fitAddon = new FitAddon();
        this.term.loadAddon(fitAddon);
        this.term.loadAddon(new WebLinksAddon());
        fitAddon.fit();
        this.windowWidth = Math.min(80, this.term.cols - 1);
    }

    readln(): Promise<string> {
        return new Promise<string>((resolve) => {
            let result = '';
            let buffer = '';
            this.term.write('> ');
            const o = this.term.onData((e) => {
                buffer += e;
                if (buffer.endsWith(konamiCode)) {
                    result = konamiCode;
                    e = '\r';
                }
                switch (e) {
                case '\r': // Enter
                    this.term.writeln('\r');
                    resolve(result);
                    o.dispose();
                    break;
                case '\u007F': // Backspace (DEL)
                    if (result.length > 0) {
                        this.term.write('\b \b');
                        result = result.substring(0, result.length - 1);
                    }
                    break;
                default:
                    if ((e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E)) || e >= '\u00a0') {
                        result += e;
                        this.term.write(e);
                    }
                }
            });
        });
    }

    write(text: string) {
        this.term.write(text);
    }

    writeln(text: string) {
        text = lineBreak(
            center(
                highlight(text),
                this.windowWidth,
            ),
            this.windowWidth,
        );

        for (const line of text.split('\n')) {
            this.term.writeln(line);
        }
    }
}
