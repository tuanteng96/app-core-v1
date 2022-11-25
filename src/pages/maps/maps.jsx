import React from "react";
import { SERVER_APP } from "./../../constants/config";
import { Page, Link, Toolbar, Navbar } from "framework7-react";
import ReactHtmlParser from "react-html-parser";
import ToolBarBottom from "../../components/ToolBarBottom";
import UserService from "../../service/user.service";
import Slider from "react-slick";
import NotificationIcon from "../../components/NotificationIcon";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      arrMaps: [],
      showPreloader: false,
    };
  }

  componentDidMount() {
    this.setState({ width: window.innerWidth });

    UserService.getStock()
      .then((response) => {
        const { all } = response.data.data;
        const newAll = all.filter((item) => item.ID !== 778);
        this.setState({
          arrMaps: newAll,
          currentMap: newAll[0].Map,
          currentID: newAll[0].ID,
        });
      })
      .catch((e) => console.log(e));
  }

  handStyle = () => {
    const _width = this.state.width - 150;
    return Object.assign({
      width: _width,
    });
  };
  handleMaps = (item) => {
    this.setState({
      currentMap: item.Map,
      currentID: item.ID,
    });
  };

  render() {
    const { arrMaps, currentMap, currentID } = this.state;
    const settingsMaps = {
      className: "slider variable-width",
      dots: false,
      arrows: false,
      infinite: true,
      slidesToShow: 1,
      //centerPadding: "20px",
      variableWidth: true,
    };
    return (
      <Page name="maps">
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span
                className="title"
                onClick={() =>
                  this.$f7.views.main.router.navigate(
                    this.$f7.views.main.router.url,
                    {
                      reloadCurrent: true,
                    }
                  )
                }
              >
                Hệ thống Spa / Thẩm mỹ
              </span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="page-wrapper page-maps">
          {/* <div className="page-maps__back">
            <Link onClick={() => this.$f7router.back()}>
              <i className="las la-arrow-left"></i>
            </Link>
          </div> */}

          <div className="page-render page-maps__box p-0">
            {currentMap && (
              <iframe
                src={ReactHtmlParser(currentMap)}
                frameBorder={0}
                allowFullScreen
                aria-hidden="false"
                tabIndex={0}
                loading="lazy"
              />
            )}
          </div>
          <div className="page-maps__list">
            <Slider {...settingsMaps}>
              {arrMaps &&
                arrMaps.map((item, index) => (
                  <div
                    className={`page-maps__list-item ${
                      currentID === item.ID ? "active" : ""
                    }`}
                    key={index}
                    style={this.handStyle()}
                    onClick={() => this.handleMaps(item)}
                  >
                    <div className="page-maps__list-pd">
                      <div className="star">
                        <i className="las la-star"></i>
                        <i className="las la-star"></i>
                        <i className="las la-star"></i>
                        <i className="las la-star"></i>
                        <i className="las la-star"></i>
                        <i className="las la-location-arrow"></i>
                      </div>
                      <h3>{item.Title}</h3>
                      <ul>
                        <li className="address">
                          <i className="las la-map-marked-alt"></i>
                          <div className="min-h-40px">{ReactHtmlParser(item.Desc)}</div>
                        </li>
                        <li className="phone">
                          <i className="las la-phone-volume"></i>
                          {item.LinkSEO || "Chưa có"}
                        </li>
                        <li className="time">
                          <span>Đang mở cửa</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ))}
            </Slider>
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
