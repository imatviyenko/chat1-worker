# Chat1 worker
This component is responsible for running background tasks required for proper operation and maintance of the chat system. It is implemented as a set of Azure Functions running in the context of a single Azure Function App.
The table below list background tasks implemented in the worker component. All functions are timer triggered and are executed by a single instance managed by Azure runtime.

| Task                                   | Trigger                 | Comments                                               |
| -------------------------------------- | ----------------------- | ------------------------------------------------------ |
| Send email alerts                      | timer (every 1 minute) | Process email alerts registered in the database        |
| Reset online status for stale users    | timer (every 1 minute) | When back-end instance crashes, online status need to reset for users connected to it via WebSocket |

## Configuration and deployment to Azure
The initial configuration of this project was done according to the instructions in [Create your first function using Visual Studio Code](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-function-vs-code)

We want our Azure functions to be triggered by timer, so if we want the Function App to be hosted on an App Service plan to save money, this App Service plan needs to be at lest "Basic" tier to enable "Always On" option, so that our functions are functioning properly:
https://stackoverflow.com/questions/39430932/how-do-i-turn-on-always-on-for-an-azure-function


After Azure Functions extensions and Azure Functions SDK was installed, VSCode Azure Functions extensio was used to:
- create a new project for Azure Function App
- a new Azure Function App named "chat1-worker-function-app" was created using Azure command group in the left -> Functions -> Deploy to Function App... -> Create new Function App in Azure... Advanced command
- Windows OS was selected
- Function App was created with "App Service" hosting plan and  delpoyed to App Service existing basic tier plan "app-service-plan-chat1-b1"
- A new Azure storage account "sachat1worker" was created

# Debugging Azure functions
Open this URL to view function logs: https://chat1-worker-function-app.scm.azurewebsites.net/api/logstream

More information [here](https://markheath.net/post/three-ways-view-error-logs-azure-functions)