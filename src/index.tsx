import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "@dhis2/app-runtime";
import 'bootstrap/dist/css/bootstrap.min.css';


const dynamicBaseUrl = window.location.origin.includes("local")
  ? process.env.REACT_APP_DHIS2_BASE_URL
  : `${window.location.origin}/`;

let pathname;
if (window.location.pathname) {
  pathname = `${window.location.pathname.split("/")[1]}`;
  if (pathname === "api") pathname = false;
}

const actualBaseUrl = pathname
  ? `${dynamicBaseUrl}${pathname}/`
  : dynamicBaseUrl;

// console.log("actualBaseUrl is ", actualBaseUrl);

const appConfig = {
  // baseUrl: process.env.REACT_APP_DHIS2_BASE_URL,
  // baseUrl: "https://qihmisug.org/dhis/",
  baseUrl: actualBaseUrl,
  apiVersion: 32,
};

ReactDOM.render(
  <Provider config={appConfig}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
