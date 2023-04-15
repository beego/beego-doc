const path = require("path");
module.exports = {
  title: "Beego",
  base: "/beego/",
  toc: {
    includeLevel: [1, 2, 3, 4],
  },
  head: [
    [
      "meta",
      {
        name: "keywords",
        content: "beego,Go框架,golang",
      },
    ],
  ],
  locales: {
    "/": {
      lang: "en-US",
      title: "Beego",
      description: "The easiest to use framework",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "Beego",
      description: "最简单的企业级应用框架",
      themeConfig: {},
    },
  },
  configureWebpack: () => {
    const NODE_ENV = process.env.NODE_ENV;
    //判断是否是生产环境
    if (NODE_ENV === "production") {
      return {
        output: {
          publicPath: "https://cdn.gocn.vip/beego/",
        },
        resolve: {
          //配置路径别名
          alias: {
            public: path.resolve(__dirname, "./public"),
          },
        },
      };
    } else {
      return {
        resolve: {
          //配置路径别名
          alias: {
            public: path.resolve(__dirname, "./public"),
          },
        },
      };
    }
  },
  themeConfig: {
    sidebar: "auto",
    displayAllHeaders: true,
    locales: {
      "/": {
        nav: [
          {
            text: "Version",
            ariaLabel: "Version",
            items: [
              {text: 'developing', link: '/en-US/developing/'},
              { text: "v2.0.x", link: "/en-US/v2.0.x/" },
              { text: "v2.1.0", link: "/en-US/v2.1.0/" }
            ],
          },
        ],
        sidebar: {
          "/en-US/developing/": buildVersionSideBarEn("developing"),
          "/en-US/v2.0.x/": buildVersionSideBarEn("v2.0.x"),
          "/en-US/v2.1.0/": buildVersionSideBarEn("v2.1.0"),
        },
      },
      "/zh/": {
        nav: [
          {
            text: "Version",
            ariaLabel: "Version",
            items: [
              { text: "developing", link: "/zh/developing/" },
              {text: 'v2.0.x', link: '/zh/v2.0.x/'},
              {text: 'v2.1.0', link: '/zh/v2.1.0/'}
            ],
          },
        ],
        sidebar: {
          "/zh/developing/": buildVersionSideBar("developing"),
          "/zh/v2.0.x/": buildVersionSideBar("v2.0.x"),
          "/zh/v2.1.0/": buildVersionSideBar("v2.1.0"),
        },
      },
    },
  },
};

function buildVersionSideBarEn() {
  return [
    "environment/",
    "bee/",
    "config/",
    {
      title: "Web Module",
      collapsable: true,
      sidebarDepth: 0,
      children: [
        {
          title: "Routes",
          collapsable: true,
          sidebarDepth: 0,
          children: [
            "web/router/ctrl_style/",
            "web/router/functional_style/",
            "web/router/router_tree",
            "web/router/namespace",
            "web/router/best_practice",
          ],
        },
        "web/input/",
        "web/file/",
        "web/session/",
        "web/cookie/",
        "web/error/",
        "web/admin/",
        "web/xsrf/",
        {
          title: "View",
          collapsable: true,
          sidebarDepth: 0,
          children: [
            "web/view/",
            "web/view/func.md",
            "web/view/page.md",
            "web/view/static_file.md",
          ],
        },
        "web/grace",
      ],
    },
    {
      title: "ORM",
      collapsable: true,
      sidebarDepth: 0,
      children: [
        "orm/",
        "orm/db.md",
        "orm/model.md",
        "orm/orm.md",
        "orm/transaction.md",
        "orm/query_builder.md",
        "orm/query_seter.md",
        "orm/raw_seter.md",
        "orm/query_m2m.md",
      ],
    },
    {
      title: "Cache",
      collapsable: true,
      sidebarDepth: 0,
      children: [
          "cache/cache_pattern.md"
      ],
    },
    "logs/",
    "validation/",
    "task/",
    "i18n/",
    {
      title: "Q & A",
      collapsable: true,
      sidebarDepth: 1,
      children: [
        ["qa/", "QA"],
        "qa/failed_to_start_web_server",
        // 'writing-a-theme',
        // 'option-api',
        // 'default-theme-config',
        // 'blog-theme',
        // 'inheritance'
      ],
    },
  ];
}

function buildVersionSideBar() {
  return [
    "environment/",
    "bee/",
    "config/",
    {
      title: "Web 模块",
      collapsable: true,
      sidebarDepth: 0,
      children: [
        {
          title: "路由",
          collapsable: true,
          sidebarDepth: 0,
          children: [
            "web/router/ctrl_style/",
            "web/router/functional_style/",
            "web/router/router_tree",
            "web/router/namespace",
            "web/router/best_practice",
          ],
        },
        "web/input/",
        "web/file/",
        "web/session/",
        "web/cookie/",
        "web/error/",
        "web/admin/",
        "web/xsrf/",
        {
          title: "视图",
          collapsable: true,
          sidebarDepth: 0,
          children: [
            "web/view/",
            "web/view/func.md",
            "web/view/page.md",
            "web/view/static_file.md",
          ],
        },
        "web/grace",
      ],
    },
    {
      title: "ORM",
      collapsable: true,
      sidebarDepth: 0,
      children: [
        "orm/",
        "orm/db.md",
        "orm/model.md",
        "orm/orm.md",
        "orm/transaction.md",
        "orm/query_builder.md",
        "orm/query_seter.md",
        "orm/raw_seter.md",
        "orm/query_m2m.md",
      ],
    },
    {
      title: "缓存",
      collapsable: true,
      sidebarDepth: 0,
      children: [
        "cache/",
        "cache/cache_pattern.md"
      ],
    },
    "logs/",
    "validation/",
    "task/",
    "i18n/",
    {
      title: "Q & A",
      collapsable: true,
      sidebarDepth: 1,
      children: [
        ["qa/", "阅读之前"],
        "qa/failed_to_start_web_server",
        // 'writing-a-theme',
        // 'option-api',
        // 'default-theme-config',
        // 'blog-theme',
        // 'inheritance'
      ],
    },
  ];
}
