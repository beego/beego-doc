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
                            {text: 'developing', link: '/developing/'},
                            {text: 'developing', link: '/developing/'}
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
                            {text: 'developing', link: '/zh/developing/'},
                            {text: 'developing', link: '/zh/developing/'}
                        ]
                    }
                ],
            }
        },


    }
}