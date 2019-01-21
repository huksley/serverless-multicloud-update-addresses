'use strict';

const sql = require("mssql");
const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GOOGLE_KEY | "123",
    Promise: Promise
});

/* eslint-disable no-param-reassign */

async function updateAddresses(context) {
  context.log('Starting updateAddresses');
  
    var config = {
        user: process.env.SQL_USER | "user",
        password: process.env.SQL_PASSWORD | "123",
        server: process.env.SQL_SERVER | "localhost:1433", 
        database: process.env.SQL_DB | 'testdb1',
        options: {
            encrypt: process.env.SQL_ENCRYPT !== undefined ? process.env.SQL_ENCRYPT : true
        }
    };

    context.log("Using config", config, "to login to MS-SQL")
    sql.connect(config, function (err) {
        if (err) context.log(err);
        const request = new sql.Request();
        request.query('select * from Saleslt.Address where Lat = 1 or Lng = 1', async function (err, result) {
            if (err) context.log(err)

            let recordset = result.recordsets[0]
            context.log("Total records", recordset.length);
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
                        })
                    } else {
                        console.warn("Bad response", geores)
                    }
                }).asPromise().catch(err => context.log(err))
            })

            Promise.all(promises).then(function () {
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: "Updated " + n + " addresses"
                };

                sql.close();
                context.done();
            })
        });
    });
};

module.exports.updateAddresses = updateAddresses;

if (process.env.RUN_CONSOLE) {
    console.log("Run in console");
    const ctx = {
        log: console.log,
        done: function () {
            console.log("Done, result: ", ctx.res.body)
        }
    }
    updateAddresses(ctx)
}