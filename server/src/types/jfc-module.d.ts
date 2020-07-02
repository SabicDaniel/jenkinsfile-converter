declare module '*/assets/jfc-module.js' {
    export function jenkinsToCCI(
        jenkinsfile: string,
        rid?: string
    ): Promise<string>;
}
