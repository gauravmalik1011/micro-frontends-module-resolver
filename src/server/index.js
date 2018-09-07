// import React from 'react';
import express from 'express';
import cors from 'cors';
import path from 'path';
import chalk from 'chalk';
import manifestHelpers from 'express-manifest-helpers';
import bodyParser from 'body-parser';
import { configureStore } from '../shared/modules/Home/store';
import serverRenderer from './moduleRenderer';
import paths from '../../config/paths';

require('dotenv').config();

const app = express();

// Use Nginx or Apache to serve static assets in production or remove the if() around the following
// lines to use the express.static middleware to serve assets for production (not recommended!)
// if (process.env.NODE_ENV === 'development') {
app.use(paths.publicPath, express.static(path.join(paths.clientBuild, paths.publicPath)));
app.use('/favicon.ico', (req, res) => {
    res.send('');
});
// }s

app.use(cors());

app.use(bodyParser.json());

app.use((req, res, next) => {
    req.store = configureStore();
    return next();
});

const manifestPath = path.join(paths.clientBuild, paths.publicPath);

app.use(
    manifestHelpers({
        manifestPath: `${manifestPath}/manifest.json`,
    })
);

app.use(serverRenderer());

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    return res.status(404).json({
        status: 'error',
        message: err.message,
        stack:
            // print a nicer stack trace by splitting line breaks and making them array items
            process.env.NODE_ENV === 'development' &&
            (err.stack || '')
                .split('\n')
                .map((line) => line.trim())
                .map((line) => line.split(path.sep).join('/'))
                .map((line) =>
                    line.replace(
                        process
                            .cwd()
                            .split(path.sep)
                            .join('/'),
                        '.'
                    )
                ),
    });
});

app.listen(process.env.PORT || 8001, () => {
    console.log(
        `[${new Date().toISOString()}]`,
        chalk.blue(`App is running: 🌎 http://localhost:${process.env.PORT || 8001}`)
    );
});

export default app;

export const test = 'FOO';