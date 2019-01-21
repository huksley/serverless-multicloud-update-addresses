# 

https://update-addresses.azurewebsites.net/api/updateAddresses

Error:

The function runtime is unable to start. Microsoft.Azure.WebJobs.Script.WebHost: Host thresholds exceeded: [Threads, Processes]. For more information, see https://aka.ms/functions-thresholds.
Session Id: e12a0d8240b746dd9cba81bbae1ad9e9

Timestamp: 2019-01-21T08:08:19.770Z

2019-01-21T08:09:18  No new trace in the past 1 min(s).
2019-01-21T08:10:18  No new trace in the past 2 min(s).
2019-01-21T08:11:18  No new trace in the past 3 min(s).
2019-01-21T08:12:18  No new trace in the past 4 min(s).
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



curl -v https://update-addresses.azurewebsites.net/api/updateAddresses
Function host is not running.

