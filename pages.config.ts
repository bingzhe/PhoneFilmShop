import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: {
    navigationStyle: 'default',
    navigationBarTitleText: 'unibest',
    navigationBarBackgroundColor: '#f8f8f8',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
      '^(?!z-paging-refresh|z-paging-load-more)z-paging(.*)':
        'z-paging/components/z-paging$1/z-paging$1.vue',
    },
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#00A3FF',
    backgroundColor: '#F8F8F8',
    borderStyle: 'black',
    height: '50px',
    fontSize: '10px',
    iconWidth: '24px',
    spacing: '3px',
    list: [
      {
        iconPath: 'static/tabbar/home-off.png',
        selectedIconPath: 'static/tabbar/home-on.png',
        pagePath: 'pages/index/index',
        text: '型号查询',
      },
      {
        iconPath: 'static/tabbar/video-off.png',
        selectedIconPath: 'static/tabbar/video-on.png',
        pagePath: 'pages/order-system-home/order-system-home',
        text: '下单系统',
      },
      {
        iconPath: 'static/tabbar/my-off.png',
        selectedIconPath: 'static/tabbar/my-on.png',
        pagePath: 'pages/service-added/service-added',
        text: '增值服务',
      },
    ],
  },
})
