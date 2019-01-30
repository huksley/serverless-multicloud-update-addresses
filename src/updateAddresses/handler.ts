"use strict";

import * as sql from "mssql";
import * as googleMapSdk from "@google/maps";
import { Context } from "serverless-azure-functions";
import { ServerResponse } from "http";
import { Http2ServerResponse } from "http2";
import { resolve } from "url";

const googleMapsClient = googleMapSdk.createClient({
  key: process.env.GOOGLE_KEY || "123"
});

/* eslint-disable no-param-reassign */
async function ignoreExceptions(f: Function, context: any = null) {
  try {
    f();
  } catch (e) {
    if (context != null) {
      context.log(e);
    } else {
      console.log(e);
    }
  }
}

/* Declared during build after TS -> JS compilation */
declare var BUILD_TIME: string;

async function updateAddresses(context: Context) {
  context.log(
    "Starting updateAddresses, build time: ",
    typeof BUILD_TIME !== "undefined" ? BUILD_TIME : "dev"
  );

  let config = {
    user: process.env.SQL_USER || "123",
    password: process.env.SQL_PASSWORD || "123",
    server: process.env.SQL_SERVER || "localhost",
    database: process.env.SQL_DB || "testdb1",
    options: {
      encrypt:
        process.env.SQL_ENCRYPT !== undefined ? process.env.SQL_ENCRYPT : true
    }
  };

  context.log(
    "Using config",
    Object.assign({}, config, { password: "<redacted>" }),
    "to login to MS-SQL",
    sql
  );

  let result = sql
    .connect(config)
    .then(_ => {
      context.log("After connect");
      const request = new sql.Request();
      return request
        .query(
          "select * from Saleslt.Address where Lat = 1 or Lng = 1 or Lat is null or Lng is null"
        )
        .then(result => {
          let recordset = result.recordsets[0];
          context.log("Total records", recordset.length);
          let n = 0;
          let promises = recordset.map(async r => {
            let addr =
              r.AddressLine1 +
              ", " +
              r.City +
              ", " +
              r.StateProvince +
              " " +
              r.PostalCode +
              " " +
              r.CountryRegion;
            context.log("Geocoding", addr);

            return googleMapsClient
              .geocode({
                address: addr
              })
              .asPromise()
              .then(geores => {
                if (
                  geores &&
                  geores.json.results &&
                  geores.json.results.length > 0
                ) {
                  let res = geores.json.results[0];
                  let lat = res.geometry.location.lat;
                  let lng = res.geometry.location.lng;
                  context.log("Got address coords", lat, lng);
                  request
                    .query(
                      "update Saleslt.Address set Lat = " +
                        lat +
                        ", Lng = " +
                        lng +
                        " where AddressID = " +
                        r.AddressID
                    )
                    .then(_ => {
                      n++;
                    })
                    .catch(e => context.log(e));
                } else {
                  context.log("Incomplete response", geores);
                }
              })
              .catch(err => context.log("Failed to geocode", err));
          });

          return Promise.all(promises)
            .then(_ => {
              context.res = {
                // status: 200, /* Defaults to 200 */
                body: "Updated " + n + " addresses"
              };

              ignoreExceptions(_ => sql.close());
              context.log("Finished updating addresses");
              return context.res;
            })
            .catch(e => {
              context.log("Failed to run all of updates, got error", e);
              context.res = {
                status: 500,
                body: "Failed to run all updates: " + e
              };
              return context.res;
            });
        })
        .catch(err => {
          context.log(err);
          context.res = {
            status: 500,
            body: "Failed query " + err
          };

          ignoreExceptions(_ => sql.close());
          return context.res;
        });
    })
    .catch(err => {
      context.log("After connect exception");
      context.log(err);
      context.res = {
        status: 500,
        body: "Failed to connect to DB: " + err
      };

      ignoreExceptions(_ => sql.close());
      return context.res;
    });

  // Dump any pending NodeJs eventloop tasks
  var p = <any>process;
  context.log(
    "After connect body",
    p._getActiveRequests().length,
    p._getActiveHandles().length
  );

  context.log("Result", result);
  result.then(r => {
    context.log("Got final promise and its result", r);
  });
  return result;
}

module.exports.updateAddresses = updateAddresses;

if (process.env.RUN_CONSOLE) {
  console.log("Run in console");
  const ctx = {
    log: console.log,
    res: {
      status: 0,
      body: null
    },
    done: function() {
      console.log("Done, result: ", ctx.res.status || 200, ctx.res.body);
    }
  };
  updateAddresses(ctx);
}
