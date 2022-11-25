import React from "react";
import { App, f7, View } from "framework7-react";

import { getUser, removeUserStorage, setUserStorage } from "../constants/user";
import UserService from "../service/user.service";
import { setNotiID, getNotiID } from "./../constants/user";
import routes from "../js/routes";
import { NAME_APP } from "../constants/config";
import { CLOSE_APP } from "../constants/prom21";
// import Template7 from "template7";

// window.language = localStorage.getItem("language") || "vi";
// window.locales = {
//   vi: {
//     loading: "Đang tải....",
//     THONG_KE: "Thống kê"
//   },
//   en: {
//     loading: "loading...",
//     THONG_KE: "Report"
//   },
// };
// window.localize = function (key) {
//   var language = window.language;
//   language = language.replace(/-/g, "_");
//   if (!window.locales[language]) language = language.substring(0, 2);
//   if (!window.locales[language]) language = "en";

//   return window.locales[language][key] ? window.locales[language][key] : key;
// };

// Template7.registerHelper("localize", function (value, options) {
//   return window.localize(value);
// });
// //Change
// languageChange = (e) => {
//   localStorage.setItem("language", e);
//   window.language = e;
//   this.$f7.views.main.router.navigate(this.$f7.views.main.router.url, {
//     reloadCurrent: true,
//   });
// };

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      // Framework7 Parameters
      f7params: {
        name: NAME_APP, // App name
        theme: "auto", // Automatic theme detection
        id: "vn.cser",
        // App routes
        routes: routes,
        on: {
          init: function () {
            const infoUser = getUser();
            if (infoUser) {
              UserService.getInfo().then(({ data }) => {
                if (data?.error && data?.error.indexOf("TOKEN") > -1) {
                  removeUserStorage();
                } else if (data?.token_renew) {
                  setUserStorage(data.token_renew, data);
                } else if (data?.token) {
                  setUserStorage(data.token, data);
                } else {
                  // Không phải lỗi Token
                }
              });
            }
            //console.log("Lần đầu mở App");
          },
          pageInit: function () {},
        },
        view: {
          allowDuplicateUrls: true,
          routesBeforeEnter: function (to, from, resolve, reject) {
            if (window.GlobalConfig) {
              resolve();
            }
          },
        },
      },
    };
  }

  componentDidMount() {}

  render() {
    return (
      <App params={this.state.f7params}>
        {/* Your main view, should have "view-main" class */}
        <View id="main-view" main className="safe-areas" url="/" />
      </App>
    );
  }

  notiDefault = (evt) => {
    if (Number(getNotiID()) !== Number(evt.data.id)) {
      setNotiID(evt.data.id);
      this.$f7.views.main.router.navigate(`/notification/${evt.data.id}`);
    }
  };

  notiCateProdID = (evt) => {
    this.$f7.views.main.router.navigate(`/shop/list/794/${evt.data.id}`);
  };

  notiProdID = (evt) => {
    this.$f7.views.main.router.navigate(`/shop/detail/${evt.data.id}`);
  };

  notiArtID = (evt) => {
    this.$f7.views.main.router.navigate(`/news/detail/${evt.data.id}`);
  };

  notiVoucher = (evt) => {
    this.$f7.views.main.router.navigate(`/voucher/`);
  };

  ToBackBrowser = () => {
    const { history } = this.$f7.views.main.router;
    if (history.length === 1 && history[0] === "/") {
      CLOSE_APP();
    } else {
      this.$f7.views.main.router.back();
    }
    this.$f7.views.main.app.sheet.close();
  };

  componentDidMount() {
    window.APP_READY = true;
    window.percent = 100;
    document.body.addEventListener("noti_click.go_noti", this.notiDefault);
    document.body.addEventListener("noti_click.prod_id", this.notiProdID);
    document.body.addEventListener("noti_click.art_id", this.notiArtID);
    document.body.addEventListener(
      "noti_click.cate_prod_id",
      this.notiCateProdID
    );
    document.body.addEventListener("noti_click.voucher_id", this.notiVoucher);
    window.ToBackBrowser = this.ToBackBrowser;
  }

  componentWillUnmount() {
    document.body.removeEventListener("noti_click.go_noti", this.notiDefault);
    document.body.removeEventListener("noti_click.prod_id", this.notiProdID);
    document.body.removeEventListener("noti_click.art_id", this.notiArtID);
    document.body.removeEventListener(
      "noti_click.cate_prod_id",
      this.notiCateProdID
    );
    document.body.removeEventListener(
      "noti_click.voucher_id",
      this.notiVoucher
    );
  }
}
