module.exports = {
    title: 'Beego',
    base: '/beego/',
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
                            {text: 'developing', link: '/en-US/developing/'},
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
                }
            }
        },
    }
}

function buildVersionSideBar() {
    return [
        'environment/',
        'bee/',
        'config/',
        {
            title: 'Web 模块',
            collapsable: false,
            sidebarDepth: 1,
            children: [
                ['web/router/', '概述'],
                'web/router/router_tree',
                'web/router/router_rule',
                'web/router/best_practice',
                'web/router/ctrl_style/',
                'web/router/functional_style/'

                // 'writing-a-theme',
                // 'option-api',
                // 'default-theme-config',
                // 'blog-theme',
                // 'inheritance'
            ]
        },
        {
            title: 'Q & A',
            collapsable: false,
            sidebarDepth: 1,
            children: [
                ['qa/', '阅读之前'],
                'qa/failed_to_start_web_server'
                // 'writing-a-theme',
                // 'option-api',
                // 'default-theme-config',
                // 'blog-theme',
                // 'inheritance'
            ]
        }
    ]
}