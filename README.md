# nuxt-module
Nuxt Typescript module for Roadiz API client.

## Usage

`yarn add @roadiz/nuxt-module`

### Configuration

Add module in you `nuxt.config.js` file and fill you API configuration values in `publicRuntimeConfig`:

```js
// nuxt.config.js

modules: [
    '@roadiz/nuxt-module'
],
    
publicRuntimeConfig: {
    roadiz: {
        baseURL: 'https://myroadizapi.test/api/1.0',
        apiKey: 'xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx',
        allowClientPreview: true,
        debug: false,
        origin: 'https://mywebsite.test'
    }
}
```

Make sure to add a default `origin` for any server side requests if you Roadiz API is secured by *RefererRegex*.

Add typescript declarations in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": [
      "@roadiz/nuxt-module"
    ]
  }
}
```

### API SDK

Here is a simple example how to fetch Roadiz API content during `asyncData`:

```ts
async asyncData({ $roadiz, route, req }: Context): Promise<object | void> | object | void {
    const path = route.params.pathMatch
    const response = await $roadiz.getWebResponseByPath(path)
    const pageData = response.data
    const altLinks = await $roadiz.getAlternateLinks(response)
    
    return {
        pageData,
        altLinks
    }
}
```

### Client previewing

If you enable `allowClientPreview` config, NuxtRoadizApi will append `_preview` and `token` query parameters to any
API request to your Roadiz API. `_preview` parameter will be passed-through, and `token` parameter will be added as 
`Authorization: Bearer ${token}` header.

If your user is currently *previewing* with a JWT, `$roadiz.previewingJwt` (`RoadizPreviewJwt`) object will be available 
to display information on your website.
