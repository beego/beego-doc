module.exports = {
    title: 'Beego',
    toc: {
        includeLevel:[1, 2, 3, 4]
    },
    locales: {
        '/': {
            lang: 'en-US',
            title: 'Beego',
            description: 'The most easy use framework'
        },
        '/zh/': {
            lang: 'zh-CN',
            title: 'Beego',
            description: '最简单的企业级应用框架',
            themeConfig: {

            }
        }
    },
    themeConfig: {
        sidebar: 'auto',
        displayAllHeaders: true,
        locales: {
            '/': {
                nav: [
                    {
                        text: 'Version',
                        ariaLabel: 'Version',
                        items: [
                            {text: 'developing', link: '/developing/'},
                            // {text: 'developing', link: '/developing/'}
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
                            // {text: 'developing', link: '/zh/developing/'}
                        ]
                    }
                ],
                sidebar: {
                    '/zh/developing/': buildVersionSideBar('developing'),
                    '/zh/developing/qa/': buildQaSideBar()
                }
            }
        },
    }
}

function buildQaSideBar() {
    return [
        // '/',
        'failed_to_start_web_server/',
        // 'bee/',
        // 'config/',
        // 'web/',
        // {
        //     title: 'Q & A',
        //     collapsable: false,
        //     sidebarDepth: 2,
        //
        //     children: [
        //         ['qa/', '阅读之前'],
        //         'qa/failed_to_start_web_server',
        //         // 'writing-a-theme',
        //         // 'option-api',
        //         // 'default-theme-config',
        //         // 'blog-theme',
        //         // 'inheritance'
        //     ]
        // }
    ]
}

function buildVersionSideBar(version) {
    return [
        'environment/',
        'bee/',
        'config/',
        'web/',
        {
            title: 'Q & A',
            collapsable: false,
            sidebarDepth: 2,

            children: [
                ['qa/', '阅读之前'],
                'qa/failed_to_start_web_server',
                // 'writing-a-theme',
                // 'option-api',
                // 'default-theme-config',
                // 'blog-theme',
                // 'inheritance'
            ]
        }
    ]
}