import * as fs from "fs";
import * as path from "path";
import { Logger } from "../logging";
import { ApplicationInsightsOptions, LogInstrumentationOptions, OTLPExporterConfig } from "../../types";

const ENV_CONFIGURATION_FILE = "APPLICATIONINSIGHTS_CONFIGURATION_FILE";
const ENV_CONTENT = "APPLICATIONINSIGHTS_CONFIGURATION_CONTENT";

export class JsonConfig {
    private static _instance: JsonConfig;
    public enableAutoCollectExceptions: boolean;
    public logInstrumentationOptions: LogInstrumentationOptions;
    public extendedMetrics: { [type: string]: boolean };
    /** OTLP Trace Exporter Configuration */
    public otlpTraceExporterConfig?: OTLPExporterConfig;
    /** OTLP Metric Exporter Configuration */
    public otlpMetricExporterConfig?: OTLPExporterConfig;
    /** OTLP Log Exporter Configuration */
    public otlpLogExporterConfig?: OTLPExporterConfig;
    /**
     * Sets the state of performance tracking (enabled by default)
     * if true performance counters will be collected every second and sent to Azure Monitor
     */
    public enableAutoCollectPerformance?: boolean;

    public static getInstance() {
        if (!JsonConfig._instance) {
            JsonConfig._instance = new JsonConfig();
        }
        return JsonConfig._instance;
    }

    constructor() {
        this._loadJsonFile();
    }

    private _loadJsonFile() {
        let jsonString = "";
        const contentJsonConfig = process.env[ENV_CONTENT];
        // JSON string added directly in env variable
        if (contentJsonConfig) {
            jsonString = contentJsonConfig;
        }
        // JSON file
        else {
            const configFileName = "applicationinsights.json";
            const rootPath = path.join(__dirname, "../../../"); // Root of folder (__dirname = ../dist-esm/src)
            let tempDir = path.join(rootPath, configFileName); // default
            const configFile = process.env[ENV_CONFIGURATION_FILE];
            if (configFile) {
                if (path.isAbsolute(configFile)) {
                    tempDir = configFile;
                } else {
                    tempDir = path.join(rootPath, configFile); // Relative path to applicationinsights folder
                }
            }
            try {
                jsonString = fs.readFileSync(tempDir, "utf8");
            } catch (err) {
                Logger.getInstance().info("Failed to read JSON config file: ", err);
            }
        }
        try {
            const jsonConfig: ApplicationInsightsOptions = JSON.parse(jsonString);
            this.enableAutoCollectExceptions = jsonConfig.enableAutoCollectExceptions;
            this.logInstrumentationOptions = jsonConfig.logInstrumentationOptions;
            this.extendedMetrics = jsonConfig.extendedMetrics;
            this.otlpLogExporterConfig = jsonConfig.otlpLogExporterConfig;
            this.otlpMetricExporterConfig = jsonConfig.otlpMetricExporterConfig;
            this.otlpTraceExporterConfig = jsonConfig.otlpTraceExporterConfig;
            this.enableAutoCollectPerformance = jsonConfig.enableAutoCollectPerformance;
        } catch (err) {
            Logger.getInstance().info("Missing or invalid JSON config file: ", err);
        }
    }
}
