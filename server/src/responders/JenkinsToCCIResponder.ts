import * as axios from 'axios';
import * as fs from 'fs';
import * as util from 'util';
import * as uuid from 'uuid';

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
            .jenkinsToCCI(req.body, uuid.v4())
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
        res.status(JenkinsToCCIResponder.httpErrorStatus(err))
            .set('Content-Type', 'application/json')
            .end(
                JSON.stringify(
                    {
                        greeting:
                            'Conversion failed. Please contact support with this entire error message.',
                        at: new Date().toUTCString(),
                        serverVersion: serverVersion,
                        calling: `${req.method} ${req.path}`,
                        reason: err ? err.message : '',
                        verbose: util.format(err)
                    },
                    null,
                    4
                )
            );
    }

    private static httpErrorStatus(err: any): number {
        try {
            switch (true) {
                case err.errorSide === 'client':
                    return 400;
                case err.errorSide === 'server':
                default:
                    return 500;
            }
        } catch (err) {
            return 500;
        }
    }
}

export { JenkinsToCCIResponder };
