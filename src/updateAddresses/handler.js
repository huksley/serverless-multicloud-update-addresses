"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var sql = require("mssql");
var googleMapSdk = require("@google/maps");
var googleMapsClient = googleMapSdk.createClient({
    key: process.env.GOOGLE_KEY || "123"
});
/* eslint-disable no-param-reassign */
function ignoreExceptions(f, context) {
    if (context === void 0) { context = null; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                f();
            }
            catch (e) {
                if (context != null) {
                    context.log(e);
                }
                else {
                    console.log(e);
                }
            }
            return [2 /*return*/];
        });
    });
}
function updateAddresses(context) {
    return __awaiter(this, void 0, void 0, function () {
        var config, result, p;
        var _this = this;
        return __generator(this, function (_a) {
            context.log("Starting updateAddresses, build time: ", typeof BUILD_TIME !== "undefined" ? BUILD_TIME : "dev");
            config = {
                user: process.env.SQL_USER || "123",
                password: process.env.SQL_PASSWORD || "123",
                server: process.env.SQL_SERVER || "localhost",
                database: process.env.SQL_DB || "testdb1",
                options: {
                    encrypt: process.env.SQL_ENCRYPT !== undefined ? process.env.SQL_ENCRYPT : true
                }
            };
            context.log("Using config", Object.assign({}, config, { password: "<redacted>" }), "to login to MS-SQL", sql);
            result = sql
                .connect(config)
                .then(function (_) {
                context.log("After connect");
                var request = new sql.Request();
                return request
                    .query("select * from Saleslt.Address where Lat = 1 or Lng = 1 or Lat is null or Lng is null")
                    .then(function (result) {
                    var recordset = result.recordsets[0];
                    context.log("Total records", recordset.length);
                    var n = 0;
                    var promises = recordset.map(function (r) { return __awaiter(_this, void 0, void 0, function () {
                        var addr;
                        return __generator(this, function (_a) {
                            addr = r.AddressLine1 +
                                ", " +
                                r.City +
                                ", " +
                                r.StateProvince +
                                " " +
                                r.PostalCode +
                                " " +
                                r.CountryRegion;
                            context.log("Geocoding", addr);
                            return [2 /*return*/, googleMapsClient
                                    .geocode({
                                    address: addr
                                })
                                    .asPromise()
                                    .then(function (geores) {
                                    if (geores &&
                                        geores.json.results &&
                                        geores.json.results.length > 0) {
                                        var res = geores.json.results[0];
                                        var lat = res.geometry.location.lat;
                                        var lng = res.geometry.location.lng;
                                        context.log("Got address coords", lat, lng);
                                        request
                                            .query("update Saleslt.Address set Lat = " +
                                            lat +
                                            ", Lng = " +
                                            lng +
                                            " where AddressID = " +
                                            r.AddressID)
                                            .then(function (_) {
                                            n++;
                                        })
                                            .catch(function (e) { return context.log(e); });
                                    }
                                    else {
                                        context.log("Incomplete response", geores);
                                    }
                                })
                                    .catch(function (err) { return context.log("Failed to geocode", err); })];
                        });
                    }); });
                    return Promise.all(promises)
                        .then(function (_) {
                        context.res = {
                            // status: 200, /* Defaults to 200 */
                            body: "Updated " + n + " addresses"
                        };
                        ignoreExceptions(function (_) { return sql.close(); });
                        context.log("Finished updating addresses");
                        return context.res;
                    })
                        .catch(function (e) {
                        context.log("Failed to run all of updates, got error", e);
                        context.res = {
                            status: 500,
                            body: "Failed to run all updates: " + e
                        };
                        return context.res;
                    });
                })
                    .catch(function (err) {
                    context.log(err);
                    context.res = {
                        status: 500,
                        body: "Failed query " + err
                    };
                    ignoreExceptions(function (_) { return sql.close(); });
                    return context.res;
                });
            })
                .catch(function (err) {
                context.log("After connect exception");
                context.log(err);
                context.res = {
                    status: 500,
                    body: "Failed to connect to DB: " + err
                };
                ignoreExceptions(function (_) { return sql.close(); });
                return context.res;
            });
            p = process;
            context.log("After connect body", p._getActiveRequests().length, p._getActiveHandles().length);
            context.log("Result", result);
            result.then(function (r) {
                context.log("Got final promise and its result", r);
            });
            return [2 /*return*/, result];
        });
    });
}
module.exports.updateAddresses = updateAddresses;
if (process.env.RUN_CONSOLE) {
    console.log("Run in console");
    var ctx_1 = {
        log: console.log,
        res: {
            status: 0,
            body: null
        },
        done: function () {
            console.log("Done, result: ", ctx_1.res.status || 200, ctx_1.res.body);
        }
    };
    updateAddresses(ctx_1);
}
//# sourceMappingURL=handler.js.map