// import React from 'react';
import express from "express";
import cors from "cors";
import path from "path";
import chalk from "chalk";
import bodyParser from "body-parser";
import serverRenderer from "./moduleRenderer";
import fetch from "./fetch";
import requireFromString from "require-from-string";
import { namespaced, namespacedAction } from "redux-subspace";
import apolloClient from './initApollo';
import gql from 'graphql-tag';

const urlPrefix = "http://localhost:8002/shared";
const API_SERVER = "http://localhost:4001";

const app = express();

app.use("/favicon.ico", (req, res) => {
  res.send("");
});

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(async (req, res, next) => {
  const moduleName = req.path.split("/")[1];
  const moduleManifest = await fetch(
    urlPrefix + "/" + moduleName.toLowerCase() + ".manifest.json",
    undefined,
    true
  );

  const moduleSource = await fetch(
    urlPrefix + "/" + moduleManifest[moduleName.toLowerCase() + ".js"]
  );

  const configureStoreSource = await fetch(urlPrefix + "/configureStore.js");
  // const globalReducerSource = await fetch(urlPrefix + "/globalReducer.js");

  const moduleObj = requireFromString(moduleSource);
  const configureStore = requireFromString(configureStoreSource).default;
  // const globalReducer = requireFromString(globalReducerSource).default;

  // Gather initials task from API server

  req.store = configureStore();
  if (moduleObj.reducer) {
    req.store.attachReducers({
      [moduleName]: namespaced(moduleName)(moduleObj.reducer)
    });

    if (req.body.api) {
      const actionTypes = moduleObj.ActionTypes;
      const graphQLQuery = gql`
      {
        user {
          name
        }
        todos: tasks {
          id
          label
          done
        }
      }
      `;
      const moduleData = await apolloClient.query({query: graphQLQuery});
      console.log(moduleData);
      req.store.dispatch(
        namespacedAction(moduleName)({
          type: actionTypes.INIT,
          state: { [moduleName]: moduleData.data }
        })
      );
    }
  }

  // req.store.attachReducers({ globalData: globalReducer });

  req.moduleObj = moduleObj;
  req.moduleManifest = moduleManifest;

  return next();
});

app.use(serverRenderer());

app.listen(process.env.PORT || 8001, () => {
  console.log(
    `[${new Date().toISOString()}]`,
    chalk.blue(
      `App is running: 🌎 http://localhost:${process.env.PORT || 8001}`
    )
  );
});

export default app;

export const test = "FOO";
