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
        baseUrl: 'https://myroadizapi.test/api/1.0',
        apiKey: 'xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx',
        preview: false,
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
      "@roadiz/abstract-api-client",
      "@roadiz/nuxt-module"
    ]
  }
}
```

### API SDK

Here is a simple example how to fetch Roadiz API content during `asyncData`:

```ts
async asyncData({ $roadiz, route, req }: Context): Promise<object | void> | object | void {
    const path = req ? req.url : route.fullPath
    const response = await $roadiz.getSingleNodesSourcesByPath(path)
    const pageData = response.data
    const altLinks = $roadiz.getAlternateLinks(response)

    switch (data["@type"]) {
        case 'BlogPostListing':
            const [blogPostsResponse, blogPostTagsResponse] = await Promise.all([
                $roadiz.getNodesSourcesForType<NSBlogPost>('blogpost'),
                $roadiz.getTagsForType('blogpost')
            ])

            return {
                pageData,
                altLinks,
                blogPosts: blogPostsResponse.data["hydra:member"],
                blogPostsCount: blogPostsResponse.data["hydra:totalItems"],
                tags: blogPostTagsResponse.data["hydra:member"]
            }
    }
    
    return {
        pageData,
        altLinks
    }
}
```
