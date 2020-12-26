module.exports = {
    locales: {
        '/': {
            lang: 'en-US',
            title: 'VuePress',
            description: 'Vue-powered Static Site Generator'
        },
        '/zh/': {
            lang: 'zh-CN',
            title: 'VuePress',
            description: 'Vue 驱动的静态网站生成器'
        }
    },
    themeConfig: {
        locales: {
            '/': {
                nav: [
                    {
                        text: 'Version',
                        ariaLabel: 'Version',
                        items: [
                            {text: 'v2.0.1', link: '/v2.0.1/'},
                            {text: 'v2.0.2', link: '/v2.0.2/'}
                        ]
                    }
                ],
            },
            '/zh/': {
                nav: [
                    {
                        text: 'Version',
                        ariaLabel: 'Version',
                        items: [
                            {text: 'v2.0.1', link: '/zh/v2.0.1/'},
                            {text: 'v2.0.2', link: '/zh/v2.0.2/'}
                        ]
                    }
                ],
            }
        },


    }
}