import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import RoadizApi from '@roadiz/abstract-api-client'
import { AxiosRequestConfig } from 'axios'

export interface RoadizPluginConfig {
    baseUrl: string
    apiKey: string
    preview?: boolean
    debug?: boolean
    origin: string
}

export class NuxtRoadizApi extends RoadizApi {
    private _context: Context
    private _origin?: string | null

    constructor(
        context: Context,
        baseURL: string,
        apiKey: string,
        preview: boolean,
        debug: boolean,
        origin: string | null
    ) {
        super(baseURL, apiKey, preview, debug)
        this._context = context
        this._origin = origin
    }

    get context(): Context {
        return this._context
    }

    get origin(): string | null {
        return this._origin || null
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

export default function (context: Context, inject: Inject) {
    const { baseUrl, apiKey, preview, debug, origin } = context.$config.roadiz as RoadizPluginConfig

    inject('roadiz', new NuxtRoadizApi(context, baseUrl, apiKey, preview || false, debug || false, origin || null))
}
