import { JenkinsToCCIResponder } from './JenkinsToCCIResponder';

import type * as express from 'express';

const reqBody = 'groovy';
const resBody = 'yaml or json';

const mockServices = {
    VersionNumber: {
        versionNumber: 'jest'
    }
};

const mockReq = {
    body: reqBody
};

const mockAxiosPost = jest.fn((url, data, options) => {
    return new Promise((resolve) =>
        resolve({ data: options.transformResponse(resBody) })
    );
});

const mockAxiosPostWithReject = jest.fn().mockRejectedValue(new Error());

const mockJenkinsToCCI = jest.fn().mockResolvedValue(resBody);
const mockJenkinsToCCIWithReject = jest.fn().mockRejectedValue(new Error());

const mockRes = () => {
    return {
        status: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis()
    };
};

jest.mock('axios');
jest.mock('../../assets/jfc-module.js');
jest.mock('../../assets/cli.html');

describe('webUI', () => {
    const req = mockReq;
    const res = mockRes();

    beforeAll(async () => {
        await JenkinsToCCIResponder.webUI(
            mockServices,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );
    });

    test('header', () => {
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.set.mock.calls[0][0]).toBe('Content-Type');
        expect(res.set.mock.calls[0][1]).toBe('text/html; charset=UTF-8');
    });

    test('body', async () => {
        expect(res.end.mock.calls[0][0]).toBe(require('../../assets/cli.html'));
    });
});

describe('convertJenkinsfileToConfigYml', () => {
    const req = mockReq;
    const res = mockRes();

    beforeAll(async () => {
        const jfcModule = require('../../assets/jfc-module.js');

        jfcModule.jenkinsToCCI.mockImplementationOnce(mockJenkinsToCCI);
        jfcModule.jenkinsToCCI.mockImplementationOnce(
            mockJenkinsToCCIWithReject
        );

        await JenkinsToCCIResponder.convertJenkinsfileToConfigYml(
            mockServices,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );

        await JenkinsToCCIResponder.convertJenkinsfileToConfigYml(
            mockServices,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );
    });

    test('jenkinsToCCI', () => {
        expect(mockJenkinsToCCI.mock.calls[0][0]).toBe(reqBody);
    });

    test('header', () => {
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.set.mock.calls[0][0]).toBe('Content-Type');
        expect(res.set.mock.calls[0][1]).toBe('text/x-yaml');
    });

    test('body', async () => {
        expect(res.end.mock.calls[0][0]).toBe(resBody);
    });

    test('error-handling', () => {
        expect(res.status.mock.calls[1][0]).toBe(500);
        expect(res.set.mock.calls[1][0]).toBe('Content-Type');
        expect(res.set.mock.calls[1][1]).toBe('text/plain; charset=UTF-8');
        expect(res.end).toHaveBeenCalled();
    });
});

describe('convertJenkinsfileToJSON', () => {
    const req = mockReq;
    const res = mockRes();
    const customJenkins = 'https://jenkins.example.com/';

    beforeAll(async () => {
        const axios = require('axios');

        axios.post.mockImplementationOnce(mockAxiosPost);
        axios.post.mockImplementationOnce(mockAxiosPost);
        axios.post.mockImplementationOnce(mockAxiosPostWithReject);

        await JenkinsToCCIResponder.convertJenkinsfileToJSON(
            mockServices,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );

        Object.defineProperty(global, '__JENKINS_TARGET', {
            value: 'https://jenkins.example.com/'
        });

        await JenkinsToCCIResponder.convertJenkinsfileToJSON(
            mockServices,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );

        await JenkinsToCCIResponder.convertJenkinsfileToJSON(
            mockServices,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );
    });

    test('axios', () => {
        expect(mockAxiosPost.mock.calls[0][0]).toBe(
            'https://jenkinsto.cc/i/to-json'
        );
        expect(mockAxiosPost.mock.calls[0][1]).toBe(reqBody);
        expect(mockAxiosPost.mock.calls[1][0]).toBe(customJenkins);
        expect(mockAxiosPost.mock.calls[1][1]).toBe(reqBody);
    });

    test('header', () => {
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.set.mock.calls[0][0]).toBe('Content-Type');
        expect(res.set.mock.calls[0][1]).toBe('application/json');
    });

    test('body', async () => {
        expect(res.end.mock.calls[0][0]).toBe(resBody);
    });

    test('error-handling', () => {
        expect(res.status.mock.calls[2][0]).toBe(500);
        expect(res.set.mock.calls[2][0]).toBe('Content-Type');
        expect(res.set.mock.calls[2][1]).toBe('text/plain; charset=UTF-8');
        expect(res.end).toHaveBeenCalled();
    });
});
