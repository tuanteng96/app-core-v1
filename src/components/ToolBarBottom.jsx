import React from "react";
import { Link } from "framework7-react";
import { getUser } from "../constants/user";
import iconBook from "../assets/images/bookicon.png";
import { checkRole } from "../constants/checkRole";
import PrivateNav from "../auth/PrivateNav";
import { CheckPrivateNav } from "../constants/checkRouterHome";

export default class ToolBarCustom extends React.Component {
  constructor() {
    super();
    this.state = {
      currentUrl: "",
      infoUser: getUser(),
    };
  }
  componentDidMount() {
    var $$ = this.Dom7;
    const TYPE = checkRole();
    if (TYPE && TYPE === "ADMIN") {
      $$(".js-toolbar-bottom").find("a").eq(1).addClass("js-active");
    }
  }

  componentDidUpdate(prevProps, prevState) {
    var href = this.$f7.views.main.router.url;
    var $$ = this.Dom7;
    const TYPE = checkRole();
    
    $$(".js-toolbar-link").removeClass("js-active");
    if (prevState.currentUrl !== href) {
      $$(".js-toolbar-link").each(function () {
        const _this = $$(this);
        const hrefLink = _this.attr("href");
        if (href === "/") {
          if (!TYPE || TYPE === "M") {
            $$(".js-toolbar-bottom").find("a").eq(0).addClass("js-active");
            $$(".page-current .js-toolbar-bottom")
              .find("a")
              .eq(0)
              .addClass("js-active");
          }
          if (TYPE === "STAFF") {
            $$(".js-toolbar-bottom").find("a").eq(0).addClass("js-active");
          }
          if (TYPE === "ADMIN") {
            $$(".js-toolbar-bottom").find("a").eq(1).addClass("js-active");
          }
        }
        if (
          hrefLink === href ||
          href
            .split("/")
            .filter((o) => o)
            .some((x) =>
              hrefLink
                .split("/")
                .filter((k) => k)
                .includes(x)
            )
        ) {
          _this.addClass("js-active");
        }
      });
    }
  }

  checkTotal = () => {
    const TYPE = checkRole();

    if (TYPE === "ADMIN") {
      return 3;
    }
    if (TYPE === "STAFF") {
      const arrType = [
        CheckPrivateNav(["service"]),
        CheckPrivateNav([
          "order",
          "sale",
          "service",
          "manager",
          "director",
          "store",
          "accountant",
        ]),
        CheckPrivateNav(["director"]),
        CheckPrivateNav([
          "order",
          "sale",
          "service",
          "manager",
          "director",
          "store",
          "accountant",
        ]),
      ];
      return arrType.filter((item) => item).length;
    }
    return 5;
  };

  menuToolbar = () => {
    const TYPE = checkRole();
    switch (TYPE) {
      case "STAFF":
        return (
          <React.Fragment>
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-hand-holding-heart"
              text="Dịch vụ"
              roles={["service"]}
              href="/"
            />
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-piggy-bank"
              text="Thống kê"
              roles={[
                "order",
                "sale",
                "service",
                "manager",
                "director",
                "store",
                "accountant",
              ]}
              href="/employee/statistical/"
            />
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-chart-bar"
              text="Báo cáo"
              roles={["director"]}
              href="/report/"
            />
            {window?.GlobalConfig?.APP?.Staff?.RulesTitle && (
              <Link
                noLinkClass
                href="/rules-list/"
                className={`page-toolbar-bottom__link js-toolbar-link ${TYPE}`}
              >
                <i className="las la-certificate"></i>
                <span>Nội quy</span>
              </Link>
            )}
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-user-circle"
              text="Tài khoản"
              roles={[
                "order",
                "sale",
                "service",
                "manager",
                "director",
                "store",
                "accountant",
              ]}
              href="/detail-profile/"
            />
          </React.Fragment>
        );
      case "ADMIN":
        return (
          <React.Fragment>
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-piggy-bank"
              text="Thống kê"
              roles={[]}
              href="/employee/statistical/"
            />
            <PrivateNav
              className="page-toolbar-bottom__link js-toolbar-link"
              icon="las la-chart-bar"
              text="Báo cáo"
              roles={[]}
              href="/report/"
            />
            {window?.GlobalConfig?.APP?.Staff?.RulesTitle && (
              <Link
                noLinkClass
                href="/rules-list/"
                className={`page-toolbar-bottom__link js-toolbar-link ${TYPE}`}
              >
                <i className="las la-certificate"></i>
                <span>Nội quy</span>
              </Link>
            )}
            <Link
              noLinkClass
              href="/detail-profile/"
              className={`page-toolbar-bottom__link js-toolbar-link ${TYPE}`}
            >
              <i className="las la-user-circle"></i>
              <span>Tài khoản</span>
            </Link>
          </React.Fragment>
        );
      case "M":
        return (
          <React.Fragment>
            <Link
              noLinkClass
              href="/news/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <i className="las la-newspaper"></i>
            </Link>
            <Link
              noLinkClass
              href="/shop/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <i className="las la-shopping-cart"></i>
            </Link>
            <Link
              noLinkClass
              href="/schedule/"
              className="page-toolbar-bottom__link active"
            >
              <div className="page-toolbar-bottom__link-inner">
                <img src={iconBook} alt="Đặt lịch" />
                {/* <i className="las la-calendar-plus"></i> */}
              </div>
            </Link>
            <Link
              noLinkClass
              href="/cardservice/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <i className="las la-clipboard-list"></i>
            </Link>
            <Link
              noLinkClass
              href="/profile/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <i className="las la-user-circle"></i>
            </Link>
          </React.Fragment>
        );
      default:
        return (
          <React.Fragment>
            <Link
              noLinkClass
              href="/news/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <i className="las la-newspaper"></i>
            </Link>
            <Link
              noLinkClass
              href="/shop/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <i className="las la-shopping-cart"></i>
            </Link>
            <Link
              noLinkClass
              href="/login/"
              className="page-toolbar-bottom__link active"
            >
              <div className="page-toolbar-bottom__link-inner">
                <img src={iconBook} alt="Đặt lịch" />
              </div>
            </Link>
            <Link
              noLinkClass
              href="/maps/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <i className="las la-map-marked-alt"></i>
            </Link>
            <Link
              noLinkClass
              href="/login/"
              className="page-toolbar-bottom__link js-toolbar-link"
            >
              <i className="las la-user-circle"></i>
            </Link>
            <div className="page-toolbar-indicator">
              <div className="page-toolbar-indicator__left"></div>
              <div className="page-toolbar-indicator__right"></div>
            </div>
          </React.Fragment>
        );
    }
  };

  render() {
    return (
      <div className="page-toolbar">
        <div
          className={`page-toolbar-bottom js-toolbar-bottom total-${this.checkTotal()}`}
          id="js-toolbar-bottom"
        >
          {this.menuToolbar()}
        </div>
      </div>
    );
  }
}
