// Copyright (c) Microsoft Corporation.

import { shutdownAzureMonitor, useAzureMonitor } from "@azure/monitor-opentelemetry";
import { ApplicationInsightsConfig } from "./shared/configuration/config";
import { AutoCollectConsole } from "./logs/console";
import { LogApi } from "./logs/api";
import { logs } from "@opentelemetry/api-logs";
import { AutoCollectExceptions } from "./logs/exceptions";
import { ApplicationInsightsOptions } from "./types";

// Licensed under the MIT license.
export { TelemetryClient } from "./shim/telemetryClient";
export { ApplicationInsightsOptions } from "./types";
export { KnownSeverityLevel } from "./declarations/generated";
export {
    AvailabilityTelemetry,
    TraceTelemetry,
    ExceptionTelemetry,
    EventTelemetry,
    PageViewTelemetry,
    Telemetry,
} from "./declarations/contracts";

export { ApplicationInsightsClient } from "./applicationInsightsClient";

// To support the shim
export * from "./shim/applicationinsights";


let console: AutoCollectConsole;
let exceptions: AutoCollectExceptions;

/**
 * Initialize Application Insights
 * @param options Azure Monitor OpenTelemetry Options
 */
export function useApplicationInsights(options?: ApplicationInsightsOptions) {
    useAzureMonitor(options);
    const logApi = new LogApi(logs.getLogger("ApplicationInsightsLogger"));
    const internalConfig = new ApplicationInsightsConfig(options);
    console = new AutoCollectConsole(logApi);
    if (internalConfig.enableAutoCollectExceptions) {
        exceptions = new AutoCollectExceptions(this._logApi);
    }
    console.enable(this._internalConfig.logInstrumentationOptions);
}

/**
* Shutdown Application Insights
*/
export function shutdownApplicationInsights() {
    shutdownAzureMonitor();
    console.shutdown();
    exceptions?.shutdown();
}
