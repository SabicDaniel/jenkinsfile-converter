import * as axios from 'axios';
import * as fs from 'fs';
import * as util from 'util';

import * as jfcModule from '../../assets/jfc-module.js';

import type * as express from 'express';

import type { ExpressWrapper } from '../ExpressWrapper';

declare const __JENKINS_TARGET: string;

/* istanbul ignore next */
require.extensions &&
    (require.extensions['.html'] = (module: NodeJS.Module, filename: string) =>
        (module.exports = fs.readFileSync(filename)));
const cliHTML = require('../../assets/cli.html');

class JenkinsToCCIResponder {
    public static webUI(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ): void {
        res.status(200)
            .set('Content-Type', 'text/html; charset=UTF-8')
            .end(cliHTML);
    }

    public static convertJenkinsfileToConfigYml(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        return jfcModule
            .jenkinsToCCI(req.body)
            .then((ret) => {
                res.status(200).set('Content-Type', 'text/x-yaml').end(ret);
            })
            .catch((error) => {
                JenkinsToCCIResponder.returnErrorMessage(
                    req,
                    res,
                    error,
                    services.VersionNumber.versionNumber
                );
            });
    }

    public static convertJenkinsfileToJSON(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        return axios.default
            .post(
                typeof __JENKINS_TARGET === typeof '' && __JENKINS_TARGET !== ''
                    ? __JENKINS_TARGET
                    : 'https://jenkinsto.cc/i/to-json',
                req.body.toString('utf-8'),
                {
                    transformResponse: (res) => res
                }
            )
            .then((ret) => {
                res.status(200)
                    .set('Content-Type', 'application/json')
                    .end(ret.data);
            })
            .catch((error) => {
                JenkinsToCCIResponder.returnErrorMessage(
                    req,
                    res,
                    error,
                    services.VersionNumber.versionNumber
                );
            });
    }

    private static returnErrorMessage(
        req: express.Request,
        res: express.Response,
        err: any,
        serverVersion: string
    ): void {
        res.status(500).set('Content-Type', 'text/plain; charset=UTF-8')
            .end(`Conversion failed. Please include the message below when you contact support for this error.

At: ${new Date().toUTCString()}
Server version: ${serverVersion}
Calling: ${req.method} ${req.path}
           
Message:
${util.format(err)}

Request body (stringified):
${JSON.stringify(req.body.toString('utf-8'))}
`);
    }
}

export { JenkinsToCCIResponder };
