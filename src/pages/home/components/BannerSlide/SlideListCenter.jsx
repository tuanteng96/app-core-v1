import React from "react";
import { Link } from "framework7-react";
import NewsDataService from "../../../../service/news.service";
import Slider from "react-slick";
import { SERVER_APP } from "../../../../constants/config";
import Skeleton from "react-loading-skeleton";
import { validURL } from "../../../../constants/helpers";
export default class SlideListCenter extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoading: true,
        };
    }

    componentDidMount() {
        this.getBanner();
    }

    getBanner = () => {
        NewsDataService.getBannerName(this.props.BannerName)
            .then((response) => {
                const arrBanner = response.data.data;
                this.setState({
                    arrBanner: arrBanner,
                    isLoading: false,
                });
            })
            .catch((e) => {
                console.log(e);
            });
    };
    render() {
        const { arrBanner, isLoading } = this.state;
        if (arrBanner && arrBanner.length < 3) {
            return "";
        }
        return (
            <React.Fragment>
                {!isLoading && (
                    <React.Fragment>
                        {arrBanner && arrBanner.length > 0 && (
                            <div className={`home-slide-center bg-white ${this.props.className}`}>
                                {arrBanner &&
                                    arrBanner.slice(0, 3).map((item, index) => <Link
                                        noLinkClass
                                        href={item.Link ? item.Link : `/adv/${item.ID}`}
                                        className={`${!window.GlobalConfig.APP.Home?.SliderFull && "rounded"} overflow-hidden ${validURL(item.Link) ? "external" : ""
                                            }`}
                                        key={index}
                                    >
                                        <img
                                            src={
                                                SERVER_APP + "/Upload/image/" + item.FileName
                                            }
                                            alt={item.Title}
                                        />
                                    </Link>)}
                            </div>
                        )}
                    </React.Fragment>
                )}

                {isLoading && (
                    <div className={`home-slide-center bg-white ${this.props.className}`}>
                        <div style={{ "width": "25%" }}>
                            <Skeleton height={120} />
                        </div>
                        <div style={{ "width": "50%" }}>
                            <div className="px-15px">
                                <Skeleton height={120} />
                            </div>
                        </div>
                        <div style={{ "width": "25%" }}>
                            <Skeleton height={120} />
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    }
}
