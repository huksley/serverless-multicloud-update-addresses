# Azure FaaS + container + SQL db

## Running

npm install
npm start

## Configure local

1. Get SQL server + sample DB
2. Get Google key
3. Save to AWS SSM Parameter store secrets using chamber-template
4. Run or deploy (npm run deploy)

## Links

https://docs.microsoft.com/en-us/azure/azure-functions/set-runtime-version
https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node
https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-azure-function-azure-cli-linux
https://update-addresses3.scm.azurewebsites.net/
https://github.com/Azure/azure-functions-core-tools

## container with Metabase

```bash
az container create --resource-group testg1 --name testnginx217219 --image metabase/metabase --cpu 2 --memory 4 --dns-name-label testnginx217219 --ports 3000
```

result in http://testnginx217219.northeurope.azurecontainer.io:3000

## FaaS deploy errors

https://update-addresses.azurewebsites.net/api/updateAddresses

```
The function runtime is unable to start. Microsoft.Azure.WebJobs.Script.WebHost: Host thresholds exceeded: [Threads, Processes]. For more information, see https://aka.ms/functions-thresholds.
Session Id: e12a0d8240b746dd9cba81bbae1ad9e9
```

```
2019-01-21T08:12:21.959 [Error] Timeout value of 00:05:00 exceeded by function 'Functions.updateAddresses' (Id: '684ff9b9-43cd-4390-893d-5ffbc23bc4b5'). Initiating cancellation.
2019-01-21T08:12:41.063 [Error] Timeout value of 00:05:00 exceeded by function 'Functions.updateAddresses' (Id: '72aa1ac0-eb7a-44c1-9635-44222cc46c6c'). Initiating cancellation.
2019-01-21T08:12:41.287 [Error] Executed 'Functions.updateAddresses' (Failed, Id=72aa1ac0-eb7a-44c1-9635-44222cc46c6c)
Timeout value of 00:05:00 was exceeded by function: Functions.updateAddresses
2019-01-21T08:14:18  No new trace in the past 1 min(s).
2019-01-21T08:14:41.489 [Information] Executing 'Functions.updateAddresses' (Reason='This function was programmatically called via the host APIs.', Id=0ab320ff-0b54-4705-96eb-12f146bfb3f4)
2019-01-21T08:15:07.459 [Information] Executing 'Functions.updateAddresses' (Reason='This function was programmatically called via the host APIs.', Id=15646a5b-0ef4-4d88-9ca0-24d8f282ca85)
2019-01-21T08:15:14.588 [Information] JavaScript HTTP trigger function processed a request.
2019-01-21T08:15:14.784 [Information] Executed 'Functions.updateAddresses' (Succeeded, Id=0ab320ff-0b54-4705-96eb-12f146bfb3f4)
2019-01-21T08:15:15.838 [Information] Executing 'Functions.updateAddresses' (Reason='This function was programmatically called via the host APIs.', Id=247f8e3d-43fc-4eb4-97b1-d451a41979a6)
```

```
curl -v https://update-addresses.azurewebsites.net/api/updateAddresses
```

Function host is not running.

## Serverless invoke error

Invoking `serverless invoke -f updateAddresses` gives following error:

```
Error: [object Object]
    at module.exports.logError (/home/user/update-addr/node_modules/serverless/lib/classes/Error.js:92:11)
    at initializeErrorReporter.then.catch.e (/home/user/update-addr/node_modules/serverless/bin/serverless:65:3)
    at runCallback (timers.js:794:20)
    at tryOnImmediate (timers.js:752:5)
    at processImmediate [as _immediateCallback] (timers.js:729:5)
From previous event:
    at /home/user/update-addr/node_modules/serverless/bin/serverless:63:9
    at Object.<anonymous> (/home/user/update-addr/node_modules/serverless/bin/serverless:66:4)
    at Module._compile (module.js:652:30)
    at Object.Module._extensions..js (module.js:663:10)
    at Module.load (module.js:565:32)
    at tryModuleLoad (module.js:505:12)
    at Function.Module._load (module.js:497:3)
    at Function.Module.runMain (module.js:693:10)
    at findNodeScript.then.existing (/home/rgai/usr/node-v8.11.1-linux-x64/lib/node_modules/npm/node_modules/libnpx/index.js:268:14)
    at <anonymous>
 ```

### After deploy

```
Error:

Function (updateAddresses) Error: Failed to start language worker process for: node. node exited with code -1 . Failed to start language worker process for: node. node exited with code -1 . Failed to start language worker process for: node. node exited with code -1 .
Session Id: 8509d91e09ca492e8d2a8295115003cf

Timestamp: 2019-01-24T14:42:36.026Z
```