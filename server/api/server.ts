import fastify, { FastifyReply } from "fastify";

const server = fastify();

server.addHook("preHandler", (req, res, done) => {
  res.headers({
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers":
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  });

  if (req.method === "OPTIONS") {
    res.status(200);
    res.send();
    return;
  }

  done();
});

export function sendJSON(res: FastifyReply, code: number, json: any) {
  res
    .status(code)
    .header("Content-Type", "application/json; charset=utf-8")
    .send(json);
}

export default server;
