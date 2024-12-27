import fs from "node:fs/promises"
import { parse } from "yaml"
import { rootConfigSchema } from "./config-schema"

// Read Config file
export async function parseYAMLConfig(filepath:string){
    const configFileContent = await fs.readFile(filepath,'utf8')
    const configPath = parse(configFileContent)

    return JSON.stringify(configPath)
}

// Validate Config
export async function validateConfig(config: string){
    const validatedConfig = await rootConfigSchema.parseAsync(JSON.parse(config))

    return validatedConfig
}