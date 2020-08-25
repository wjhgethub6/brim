/* @flow */

// This is needed to use zealot outside a browser.
global.fetch = require("node-fetch")

import {execSync} from "child_process"
import path from "path"

import {createZealot} from "zealot"

import {retryUntil} from "../lib/control"
import {nodeZqDistDir} from "../lib/env"
import {handleError, stdTest} from "../lib/jest.js"
import appStep from "../lib/appStep/api"
import newAppInstance from "../lib/newAppInstance"

describe("zqd Process tests", () => {
  let app
  let testIdx = 0
  beforeEach(() => {
    app = newAppInstance(path.basename(__filename), ++testIdx)
    return appStep.startApp(app)
  })

  afterEach(async () => {
    console.log("after.each")
    if (app && app.isRunning()) {
      return await app.stop()
    }
  })

  stdTest(`zqd exists when Brim ungracefully exists`, async (done) => {
    const client = createZealot("localhost:9867")
    await client.spaces.list() // verifies no errors
    let mainpid = await app.mainProcess.pid()
    console.log("mainprocess.pid", mainpid)
    process.kill(mainpid)
    console.log("killed")

    let err
    // Make sure zqd identifies both spaces.
    await retryUntil(
      async () => {
        try {
          console.log("listing")
          let ls = await client.spaces.list()
          console.log("success", ls)
        } catch (e) {
          console.log("catch", e)
          err = e
        }
        console.log("attempt", err)
        return err
      },
      (e) => {
        console.log("we done", e)
        return e != undefined
      }
    )
    console.log("err", err)

    done()
  })
})
