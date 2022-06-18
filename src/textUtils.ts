import c from 'ansi-colors';
import stringWidth from 'string-width';




export function lineBreak(text: string, width: number): string {
    let lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let ichSpace = 0;
        let escape = false;
        let nonEscapedChars = 0;
        for (let ich = 0; ich < line.length; ich++) {
            if (escape) {
                if (line[ich] ==='m') {
                    escape = false;
                }
            } else {
                if (line[ich] === '\x1b') {
                    escape = true;
                } else {
                    nonEscapedChars++;
                    if (line[ich] === ' ') {
                        ichSpace = ich;
                    }
                    if (nonEscapedChars > width) {
                        if (ichSpace > 0) {
                            lines.splice(i + 1, 0, line.substring(ichSpace + 1));
                            lines[i] = line.substring(0, ichSpace).trimRight();
                        }
                        break;
                    }
                }
            }
        }
    }
    return lines.join('\n');
}

export function center(text: string, width: number): string {
    return text.replace(new RegExp('\\>\\>(.*)\\<\\<', 'g'), (_, part) => {
        const realLength = stringWidth(part);
        if (width > realLength)
            return  ' '.repeat((width - realLength) / 2) + part;
        else
            return part;
    });
}

export function highlight(text: string): string {
    c.enabled = true;
    text = text.replace(new RegExp('\\{\\{([^}]*)\\}\\}', 'g'), c.italic('$1'));
    return text;
}


export function a(text: string): string {
    return 'a ' + text;
}