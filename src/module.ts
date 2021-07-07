import path from 'path'
import { NuxtRoadizApi, RoadizPluginConfig } from './plugin'
import { Module } from '@nuxt/types'

declare module '@nuxt/types' {
    interface Context {
        $roadiz: NuxtRoadizApi
    }
    interface NuxtAppOptions {
        $roadiz: NuxtRoadizApi
    }
    interface Configuration {
        roadiz?: RoadizPluginConfig
    }
}

interface RoadizModuleOptions {

}

const roadizModule: Module<RoadizModuleOptions> = function (moduleOptions) {
    // Register plugin
    this.addPlugin(path.resolve(__dirname, 'plugin.js'))
}

export default roadizModule
