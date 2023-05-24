const pulumi = require("@pulumi/pulumi")
const aws = require("@pulumi/aws")
const awsx = require("@pulumi/awsx")

const endpoint = new awsx.apigateway.API("hello", {
  routes: [
    {
      path: "/",
      localPath: "www",
    },
    {
      path: "/source",
      method: "GET",
      eventHandler: (req, ctx, cb) => {
        cb(undefined, {
          statusCode: 200,
          body: Buffer.from(JSON.stringify({ name: "AWS" }), "utf8").toString("base64"),
          isBase64Encoded: true,
          headers: { "content-type": "application/json" },
        })
      },
    },
  ],
})

exports.url = endpoint.url