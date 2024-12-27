import cluster , { Worker } from "node:cluster"
import http from "node:http"
import {ConfigSchemaType , rootConfigSchema} from "./config-schema";
import {workerMessageSchema, WorkerMessageType , WorkerMessageReplyType , workerMessageReplySchema} from "./server-schema";



interface CreateServerConfig {
    port: number,
    workerCount: number,
    config: ConfigSchemaType | undefined
}

export async function createServer(config: CreateServerConfig){
    const { workerCount , port } = config
    const WORKER_POOL : Worker[] = []


    if(cluster.isPrimary){
        console.log("Master process is up")
        for(let i = 0; i < workerCount; i++){
            const w = cluster.fork({ config: JSON.stringify(config.config)})
            WORKER_POOL.push(w)
            console.log(`Worker ${i+1} is up`)
        }

        const server = http.createServer((req, res) => {
            const index = Math.floor(Math.random() * WORKER_POOL.length)
            const worker = WORKER_POOL.at(index)

            if (!worker) throw new Error("Worker not found")



            const payload: WorkerMessageType = {
                requestType: "HTTP",
                headers:req.headers,
                body:null,
                url: `${req.url}`
            }

            worker.send(JSON.stringify(payload))
        })

        server.listen(port, () => {
            console.log(`Server is up on port ${port}`)
        })

        // console.log(Object.values(cluster.workers ?? []).length) -> to get the number of the workers node
    }else{
        console.log("Worker process is up")
        const config = await rootConfigSchema.parseAsync(JSON.parse(`${process.env.config}`))

        process.on('message', async (message : string) => {
            const messageValidated = await workerMessageSchema.parseAsync(JSON.parse(message))

            const requestURL = messageValidated.url
            const rule = config.server.rules.find(e=>e.path === requestURL)

            if(!rule){
                const reply : WorkerMessageReplyType = { error: `Rule not found!`, statusCode: '404'}

                if(process.send) return process.send(JSON.stringify(reply))

            }


        })


    }
}