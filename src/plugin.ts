import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import RoadizApi from '@roadiz/abstract-api-client'
import { AxiosRequestConfig } from 'axios'

export interface RoadizPreviewJwt {
    iat: number // issued at (Unix time)
    exp: number // expiration time (Unix time)
    roles: Array<string>
    username: string
}

export interface RoadizPluginConfig {
    baseURL: string
    apiKey?: string
    preview?: boolean // deprecated: Preview mode MUST be set at request time
    allowClientPreview?: boolean
    debug?: boolean
    origin?: string
    defaults?: AxiosRequestConfig
}

export class NuxtRoadizApi extends RoadizApi {
    private _context: Context
    private _previewing: boolean
    private _previewingJwt: RoadizPreviewJwt | null
    private _allowClientPreview: boolean
    private _origin?: string

    constructor(context: Context, config: RoadizPluginConfig) {
        const { baseURL, apiKey, preview, allowClientPreview, debug, origin, defaults } = config

        super(baseURL, { apiKey, preview, debug, defaults })

        this._context = context
        this._origin = origin
        this._previewing = false
        this._previewingJwt = null
        this._allowClientPreview = allowClientPreview || false
    }

    get context(): Context {
        return this._context
    }

    get origin(): string | undefined {
        return this._origin
    }

    get isPreviewing(): boolean {
        return this._previewing
    }

    get previewingJwt(): RoadizPreviewJwt | null {
        return this._previewingJwt
    }

    protected onApiRequest(config: AxiosRequestConfig): AxiosRequestConfig {
        config = super.onApiRequest(config)

        if (process.server && this.context.req && this.context.req.headers) {
            config.headers.common.origin = this.context.req.headers.origin || this.origin || null
            config.headers.common['accept-language'] = this.context.req.headers['accept-language'] || null

            for (const propName of config.headers.common) {
                if (config.headers.common[propName] === null || config.headers.common[propName] === undefined) {
                    delete config.headers.common[propName]
                }
            }
        }

        /*
         * Pass through preview state and JWT token to Roadiz API
         */
        if (this._allowClientPreview && this.context.req && this.context.req.url) {
            // Need to prepend a https scheme to pass a valid URL.
            const currentUrl = new URL('http://localhost' + this.context.req.url)
            if (
                currentUrl.searchParams.has('_preview') &&
                currentUrl.searchParams.get('_preview') === '1' &&
                currentUrl.searchParams.has('token') &&
                currentUrl.searchParams.get('token') !== ''
            ) {
                config.params['_preview'] = '1'
                config.headers.common.Authorization = `Bearer ${currentUrl.searchParams.get('token')}`
                this._previewing = true
                this._previewingJwt = this.getJwtPayload(currentUrl.searchParams.get('token'))
            }
        }

        if (process.server) {
            // Don't accept brotli encoding because Node can't parse it
            config.headers.common['accept-encoding'] = 'gzip, deflate'
        }

        return config
    }

    protected getJwtPayload(token: string | null): RoadizPreviewJwt {
        if (token) {
            let decodedBase64
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            if (atob) {
                decodedBase64 = atob(base64)
            } else {
                decodedBase64 = Buffer.from(base64, 'base64').toString()
            }
            const jsonPayload = decodeURIComponent(
                decodedBase64
                    .split('')
                    .map((c) => {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    })
                    .join('')
            )

            return JSON.parse(jsonPayload)
        }
        throw new Error('JWT token is null')
    }
}

export default function (context: Context, inject: Inject): void {
    const config = context.$config.roadiz as RoadizPluginConfig

    if (config && config.baseURL) inject('roadiz', new NuxtRoadizApi(context, config))
}
