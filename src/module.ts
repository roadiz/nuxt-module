import { resolve } from 'path'
import { NuxtRoadizApi, RoadizPluginConfig } from './plugin'
import { Module } from '@nuxt/types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RoadizModuleOptions {}

const roadizModule: Module<RoadizModuleOptions> = function (moduleOptions) {
    const options = this.options.roadiz || moduleOptions
    // Register plugin
    this.addPlugin({
        src: resolve(__dirname, './plugin.js'),
        fileName: 'roadiz/plugins/roadiz.js',
        options,
    })
}

;(roadizModule as any).meta = require('../package.json')

declare module '@nuxt/types/config/runtime' {
    // runtime config in nuxt.config.ts
    interface NuxtRuntimeConfig {
        roadiz?: RoadizPluginConfig
    }
}

declare module '@nuxt/types' {
    interface Context {
        $roadiz?: NuxtRoadizApi
    }
    interface NuxtAppOptions {
        $roadiz?: NuxtRoadizApi
    }
    interface Configuration {
        roadiz?: RoadizPluginConfig
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $roadiz?: NuxtRoadizApi
    }
}

export default roadizModule
