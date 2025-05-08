/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "pug" {
    function compile(source: string, options?: any): (locals?: any) => string;
    function render(
        source: string,
        options?: any,
        callback?: (err: Error, html: string) => void,
    ): string;
    function renderFile(
        filename: string,
        options?: any,
        callback?: (err: Error, html: string) => void,
    ): string;
    export = {
        compile,
        render,
        renderFile,
    };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
