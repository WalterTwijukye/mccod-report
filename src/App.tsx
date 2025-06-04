// App.tsx
import React from "react";
import { HeaderBar } from "@dhis2/ui-widgets";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { DataExtraction } from "./components/DataExtraction";

export const App = () => {
  return (
    <Router>
      <>
        {/* <HeaderBar
          appName={"Uganda eHMIS - DHIS2 Events Data Extraction"}
          style={{
            left: 0,
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 1000,
          }}
        /> */}
        <div style={{ marginTop: "60px", padding: "16px" }}>
          <Switch>
            <Route exact path="/">
              <DataExtraction />
            </Route>
          </Switch>
        </div>
      </>
    </Router>
  );
};