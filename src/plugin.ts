import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import RoadizApi from '@roadiz/abstract-api-client'
import { AxiosRequestConfig } from 'axios'

export interface RoadizPluginConfig {
    baseURL: string
    apiKey?: string
    preview?: boolean
    debug?: boolean
    origin?: string
    defaults?: AxiosRequestConfig
}

export class NuxtRoadizApi extends RoadizApi {
    private _context: Context
    private _origin?: string

    constructor(context: Context, config: RoadizPluginConfig) {
        const { baseURL, apiKey, preview, debug, origin, defaults } = config

        super(baseURL, { apiKey, preview, debug, defaults })

        this._context = context
        this._origin = origin
    }

    get context(): Context {
        return this._context
    }

    get origin(): string | undefined {
        return this._origin
    }

    protected onApiRequest(config: AxiosRequestConfig): AxiosRequestConfig {
        config = super.onApiRequest(config)

        if (process.server && this.context.req && this.context.req.headers) {
            config.headers.common.origin = this.context.req.headers.origin || this.origin
            config.headers.common['accept-language'] = this.context.req.headers['accept-language'] || null

            for (const propName of config.headers.common) {
                if (config.headers.common[propName] === null || config.headers.common[propName] === undefined) {
                    delete config.headers.common[propName]
                }
            }
        }

        if (process.server) {
            // Don't accept brotli encoding because Node can't parse it
            config.headers.common['accept-encoding'] = 'gzip, deflate'
        }

        return config
    }
}

export default function (context: Context, inject: Inject): void {
    const config = context.$config.roadiz as RoadizPluginConfig

    if (config && config.baseURL) inject('roadiz', new NuxtRoadizApi(context, config))
}
