import pino, { Logger } from 'pino';
import config from './config';

const logLevelData = { '*': 'info' };
const logLevels = new Map<string, string>(Object.entries(logLevelData));

function getLogLevel(logger: string): string {
    return logLevels.get(logger) || logLevels.get('*') || 'info';
}

// TODO need configure file storage, pattern, etc.
export function getLogger(name: string): Logger {
    return pino({
        name,
        level: getLogLevel(name),
        transport: {
            targets: [
                {
                    target: 'pino/file',
                    level: 'info',
                    options: { destination: config.pinoLogFilePath.concat('/proof-gen-log.log') }
                },
                { target: 'pino-pretty', level: 'info', options: { destination: '/dev/stdout' } }
            ]
        }
    });
}


