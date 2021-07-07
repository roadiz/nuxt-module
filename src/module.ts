import { resolve } from 'path'
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
    const options = this.options.roadiz || moduleOptions
    // Register plugin
    this.addPlugin({
        src: resolve(__dirname, './plugin.js'),
        fileName: 'nuxt-module.js',
        options
    })
}

export default roadizModule
