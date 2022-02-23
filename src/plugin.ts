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

interface RoadizPreviewQuery {
    _preview?: '0' | '1'
    token?: string
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
    private _allowClientPreview: boolean
    private _origin?: string

    constructor(context: Context, config: RoadizPluginConfig) {
        const { baseURL, apiKey, preview, allowClientPreview, debug, origin, defaults } = config

        super(baseURL, { apiKey, preview, debug, defaults })

        this._context = context
        this._origin = origin
        this._allowClientPreview = allowClientPreview || false
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
        const previewingToken = this.getPreviewingToken()
        if (previewingToken !== null) {
            config.params['_preview'] = '1'
            config.headers.common.Authorization = `Bearer ${previewingToken}`
        }

        if (process.server) {
            // Don't accept brotli encoding because Node can't parse it
            config.headers.common['accept-encoding'] = 'gzip, deflate'
        }

        return config
    }

    protected getPreviewingToken(query: RoadizPreviewQuery | null = null): string | null {
        query = query || (this.context.query as RoadizPreviewQuery)
        if (this._allowClientPreview && query) {
            if (query._preview && query._preview === '1' && query.token && query.token !== '') {
                return query.token as string
            }
        }
        return null
    }

    public isPreviewing(query: RoadizPreviewQuery | null = null): boolean {
        return this.getPreviewingToken(query) !== null
    }

    public getPreviewingJwt(query: RoadizPreviewQuery | null = null): RoadizPreviewJwt | null {
        const token = this.getPreviewingToken(query)
        return token !== null ? this.getJwtPayload(token) : null
    }

    protected getJwtPayload(token: string | null): RoadizPreviewJwt {
        if (token) {
            let decodedBase64
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            if (typeof window != 'undefined' && typeof window.atob != 'undefined') {
                decodedBase64 = window.atob(base64)
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
