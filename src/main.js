import { Application } from "./core/Application.js";
import { wireMobileControls } from "./core/MobileControls.js";

const app = new Application();
app.start();

wireMobileControls(app.input);

window.__dungeonDiver = app;
