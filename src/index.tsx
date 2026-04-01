import React from "react";
import { render } from "ink";
import { App } from "./ui/App.js";
import { DEFAULT_CONFIG } from "./config/defaults.js";

render(<App config={DEFAULT_CONFIG} />);
