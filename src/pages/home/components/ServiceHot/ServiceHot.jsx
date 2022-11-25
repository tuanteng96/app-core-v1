import React from "react";
import { Link } from "framework7-react";
import Slider from "react-slick";
import ShopDataService from "../../../../service/shop.service";
import SkeletonServiceHot from "./SkeletonServiceHot";
import { SERVER_APP } from "../../../../constants/config";
import { getStockIDStorage } from "../../../../constants/user";

export default class ServiceHot extends React.Component {
  constructor() {
    super();
    this.state = {
      width: window.innerWidth,
      isLoading: true,
      arrService: [],
    };
  }

  componentDidMount() {
    this.getServicesAll();
  }
  handStyle = () => {
    const _width = this.state.width - 120;
    return Object.assign({
      width: _width,
    });
  };

  getServicesAll = () => {
    let stockid = getStockIDStorage();
    stockid ? stockid : 0;
    ShopDataService.getServiceOriginal(stockid)
      .then(({ data }) => {
        const result = data.data;
        if (result) {
          let newData = [];
          if (stockid > 0) {
            newData = result.filter((item) => {
              const arrayStatus = item?.root?.Status
                ? item.root.Status.split(",")
                : [];
              return (item.root.OnStocks.indexOf("*") > -1 || item.root.OnStocks.indexOf(stockid) > -1) && item.root.IsRootPublic && arrayStatus.indexOf("2") > -1;
            });
          } else {
            newData = result.filter((item) => {
              const arrayStatus = item?.root?.Status
                ? item.root.Status.split(",")
                : [];
              return item.root.OnStocks && item.root.IsRootPublic && arrayStatus.indexOf("2") > -1;
            });
          }
          this.setState({
            arrService: newData,
            isLoading: false,
          });
        }
      })
      .catch((err) => console.log(err));

    // ShopDataService.getServiceParent(795, stockid)
    //   .then((response) => {
    //     const { data } = response.data;
    //     const newData = data.filter((item) => {
    //       return item.root.Tags.includes("hot");
    //     });
    //     this.setState({
    //       arrService: newData,
    //       isLoading: false,
    //     });
    //   })
    //   .catch((e) => console.log(e));
  };

  handleUrl = (item) => {
    this.props.f7.navigate(
      `/shop/${item.cate.ID}/?ids=${item.root.ID}&cateid=795`
    );
  };

  render() {
    const { isLoading, arrService } = this.state;
    const settingsNews = {
      className: "slider variable-width",
      dots: false,
      arrows: false,
      infinite: true,
      slidesToShow: 1,
      centerPadding: "20px",
      variableWidth: true,
      autoplay: true,
      autoplaySpeed: 5000,
    };

    return (
      <React.Fragment>
        {!isLoading && (
          <React.Fragment>
            {arrService && arrService.length > 0 && (
              <div className="home-page__news mb-8">
                <div className="page-news__list">
                  <div className="page-news__list-ul">
                    <Slider {...settingsNews}>
                      {arrService &&
                        arrService.map((item, index) => {
                          if (index > 6) return null;
                          return (
                            <Link
                              className="page-news__list-item box-shadow-none"
                              key={item.root.ID}
                              style={this.handStyle()}
                              onClick={() => this.handleUrl(item)}
                            >
                              <div className="images bd-rd3">
                                <img
                                  src={SERVER_APP + item.root.Thumbnail_web}
                                  alt={item.root.Title}
                                />
                              </div>
                              <div className="text">
                                <h6 className="text-cut-1">
                                  {item.root.Title}
                                </h6>
                              </div>
                            </Link>
                          );
                        })}
                    </Slider>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        )}
        {isLoading && (
          <div className="home-page__news mb-8">
            <div className="page-news__list">
              <div className="page-news__list-ul">
                <SkeletonServiceHot />
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}
