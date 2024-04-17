import { Hono } from "hono";"hono/adapter";
import event from "./event";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Welcome to FEC API!");
});

app.route("/event", event);

export default app;
