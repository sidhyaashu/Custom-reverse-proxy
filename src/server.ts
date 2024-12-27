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

            worker.on('message',async (workerReply : string)=>{
                const reply = await workerMessageReplySchema.parseAsync(JSON.parse(workerReply))
                if(reply.statusCode == "404" || reply.statusCode == "500"){
                    res.writeHead(parseInt(reply.statusCode))
                    res.end(reply.error)
                    return
                }else{
                    res.writeHead(200)
                    res.end(reply.data)
                }
            })
        })

        server.listen(port, () => {
            console.log(`Server is up on port ${port}`)
        })

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

            const upstreamID = rule?.upstreams[0]

            if(!upstreamID){
                const reply: WorkerMessageReplyType ={
                    statusCode: "500",
                    error: `UpstreamID not found`
                }

                if(process.send) return process.send(JSON.stringify(reply))
            }

            const upstream = config.server.upstreams.find(e=>e.id === upstreamID)

            if(!upstream){
                const reply: WorkerMessageReplyType ={
                    statusCode: "500",
                    error: `Upstream not found`
                }

                if(process.send) return process.send(JSON.stringify(reply))
            }

            const request = http.request({
                host:upstream?.url,
                path: requestURL,
                method: 'GET'
            },(proxyRes) => {
                let body = ''
                proxyRes.on('data',(chunk)=>{
                    body += chunk
                })

                proxyRes.on('end',()=>{
                    const reply: WorkerMessageReplyType = {
                        data:body
                    }

                    if(process.send) return process.send(JSON.stringify(reply))
                })
            })

            request.end()
        })
    }
}