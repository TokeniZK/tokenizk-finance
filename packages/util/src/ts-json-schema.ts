import { resolve } from "path";
import * as TJS from "typescript-json-schema";

export function obtainSchema(basePath: string, fileName: string, typeName: string) {
    // optionally pass argument to schema generator
    const settings: TJS.PartialArgs = {
        required: true,
    };

    // optionally pass ts compiler options
    const compilerOptions: TJS.CompilerOptions = {
        strictNullChecks: true,
    };

    const program = TJS.getProgramFromFiles(
        [resolve(fileName.concat(".ts"))],
        compilerOptions,
        basePath
    );

    // We can either get the schema for one file and one type...
    const schema = TJS.generateSchema(program, typeName, settings);

}
