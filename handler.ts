'use strict';

import 'source-map-support/register'
import * as sql from 'mssql'
import * as googleMapSdk from '@google/maps'
import { Context } from 'serverless-azure-functions'
import { ServerResponse } from 'http';
import { Http2ServerResponse } from 'http2';

console.log("SDK", googleMapSdk)

const googleMapsClient = googleMapSdk.createClient({
    key: process.env.GOOGLE_KEY || "123",
    Promise: Promise
})

/* eslint-disable no-param-reassign */

async function dontcare(f: Function, context: any = null) {
    try {
        f()
    } catch (e) {
        if (context != null) {
            context.log(e)
        } else {
            console.log(e)
        }
    }
}

async function updateAddresses(context: Context) {
  context.log('Starting updateAddresses')
  
    var config = {
        user: process.env.SQL_USER || "user",
        password: process.env.SQL_PASSWORD || "123",
        server: process.env.SQL_SERVER || "localhost:1433", 
        database: process.env.SQL_DB || 'testdb1',
        options: {
            encrypt: process.env.SQL_ENCRYPT !== undefined ? process.env.SQL_ENCRYPT : true
        }
    }

    context.log("Using config", Object.assign({}, config, { "password": "***" }), "to login to MS-SQL")
    sql.connect(config).then(_ => {
        const request = new sql.Request()
        request.query('select * from Saleslt.Address where Lat = 1 or Lng = 1 or Lat is null or Lng is null', async function (err, result) {
            if (err) {
                context.log(err)
                context.res = {
                    status: 500,
                    body: "Failed query " + err
                }

                dontcare(_ => sql.close())
                context.done()
                return
            }

            let recordset = result.recordsets[0]
            context.log("Total records", recordset.length)
            let n = 0
            let promises = recordset.map(r => {
                let addr = r.AddressLine1 + ", " + r.City + ", " + r.StateProvince + " " + r.PostalCode + " " + r.CountryRegion
                context.log("Geocoding", addr)
                return googleMapsClient.geocode({
                    address: addr
                }, function (err, geores) {
                    if (geores && geores.json.results && geores.json.results.length > 0) {
                        let res = geores.json.results[0]
                        let lat = res.geometry.location.lat
                        let lng = res.geometry.location.lng
                        context.log("Got address coords", lat, lng)
                        request.query("update Saleslt.Address set Lat = " + lat + 
                            ", Lng = " + lng + " where AddressID = " + r.AddressID).then(_ => {    
                            n ++
                        }).catch(e => context.log(e))
                    } else {
                        context.log("Incomplete response", geores)
                    }
                }).asPromise().catch(err => context.log("Failed to geocode", err))
            })

            Promise.all(promises).then(_ => {
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: "Updated " + n + " addresses"
                }

                dontcare(_ => sql.close())
                context.done()
            }).catch(e => context.log("Failed to run all of updates, got error", e))
        })
    }).catch(err => {
        context.log(err)
        context.res = {
            status: 500,
            body: "Failed to connect to DB: " + err
        }

        dontcare(_ => sql.close())
        context.done()
        return
    })
}

module.exports.updateAddresses = updateAddresses

if (process.env.RUN_CONSOLE) {
    console.log("Run in console")
    const ctx = {
        log: console.log,
        res: {
            status: 0,
            body: null
        },
        done: function () {
            console.log("Done, result: ", ctx.res.status || 200, ctx.res.body)
        }
    }
    updateAddresses(ctx)
}