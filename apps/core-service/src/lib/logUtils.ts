import pino, { Logger } from 'pino';
import * as dotenv from "dotenv"
dotenv.config({ path: '../../.env' })

const loggerFlag = process.argv[2] ?? 'Main';

const pinoObj = pino({
    name: loggerFlag,
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
        targets: [
            {
                target: 'pino/file',
                level: 'info',
                options: { destination: <string>process.env.PINO_LOG_FILE_PATH!.concat(`/core-service-${loggerFlag}.log`) }
            },
            { target: 'pino-pretty', level: 'info', options: { destination: '/dev/stdout' } }
        ]
    }
});


const childLoggerMap = new Map<string, Logger>();

// TODO need configure file storage, pattern, etc.
export function getLogger(childSegment: string): Logger {
    if (!childSegment) {
        return pinoObj;
    }
    if (!childLoggerMap.get(childSegment)) {
        childLoggerMap.set(childSegment, pinoObj.child({ segment: childSegment }));
    }

    return childLoggerMap.get(childSegment)!;
}


