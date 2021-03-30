module.exports = {
    locales: {
        '/': {
            lang: 'en-US',
            title: 'Beego',
            description: 'The most easy use framework'
        },
        '/zh/': {
            lang: 'zh-CN',
            title: 'Beego',
            description: '最简单的企业级应用框架'
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