# nuxt-plugin
Nuxt Typescript plugin for Roadiz API client.

## Usage

`yarn add @roadiz/nuxt-plugin`

### Configuration

```js
// nuxt.config.js

plugins: [
    '~/node_modules/@roadiz/nuxt-plugin'
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

### API SDK

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
