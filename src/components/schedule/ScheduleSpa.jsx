import React from "react";
import { Link, Tabs, Tab, Row, Col } from "framework7-react";
import UserService from "../../service/user.service";
import IconLocation from "../../assets/images/location1.svg";
import SkeletonStock from "./SkeletonStock";
import Carousel from "nuka-carousel";
import DatePicker from "react-mobile-datepicker";
import _ from "lodash";
import { clsx } from "clsx";
import ConfigServiceAPI from "../../service/config.service";
import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

const dateConfig = {
  // hour: {
  //   format: "hh",
  //   caption: "Giờ",
  //   step: 1,
  // },
  // minute: {
  //   format: "mm",
  //   caption: "Phút",
  //   step: 1,
  // },
  date: {
    caption: "Ngày",
    format: "D",
    step: 1,
  },
  month: {
    caption: "Tháng",
    format: "M",
    step: 1,
  },
  year: {
    caption: "Năm",
    format: "YYYY",
    step: 1,
  },
};

const GroupByCount = (List, Count) => {
  return List.reduce((acc, x, i) => {
    const idx = Math.floor(i / Count);
    acc[idx] = [...(acc[idx] || []), x];
    return acc;
  }, []);
};

export default class ScheduleSpa extends React.Component {
  constructor() {
    super();
    this.state = {
      ListChoose: [],
      ListDisableChoose: [],
      arrListDate: [], // Hiển thị 3 ngày từ ngày today next
      arrStock: [], // List Stock
      timeSelected: "",
      itemBook: {},
      isLoadingStock: true,
      isActive: 0,
      isOpen: false,
      indexCurrent: 7,
    };
  }

  componentDidMount() {
    this.getStock();
    this.setState({
      width: window.innerWidth,
    });
    this.getListChoose();
    this.getDisableTime();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.DateTimeBook.stock !== prevProps.DateTimeBook.stock) {
      if (prevProps.DateTimeBook.toDate) {
        this.getListChoose(
          prevProps.DateTimeBook.toDate,
          this.state.ListDisableChoose
        );
      }
    }
  }

  getDisableTime = async () => {
    ConfigServiceAPI.getConfigName("giocam")
      .then(({ data }) => {
        if (data && data.data && data?.data.length > 0) {
          const result = JSON.parse(data.data[0].Value);
          this.getListChoose("", result);
          this.setState({
            ListDisableChoose: result,
          });
        }
      })
      .catch((error) => console.log(error));
  };

  group = (items, n) =>
    items.reduce((acc, x, i) => {
      const idx = Math.floor(i / n);
      acc[idx] = [...(acc[idx] || []), x];
      return acc;
    }, []);

  getStock = () => {
    UserService.getStock().then((response) => {
      const ListStock = response.data.data.all;
      const arrStock = [];

      ListStock.map((item) => {
        if (item.ID !== 778) {
          arrStock.push(item);
        }
      });

      this.setState({
        arrStock: arrStock,
        isLoadingStock: false,
      });
    });
  };

  getListChoose = (DateChoose, ListLock) => {
    const { TimeOpen, TimeClose, TimeNext } =
      window?.GlobalConfig?.APP?.Booking;
    const indexLock =
      ListLock &&
      ListLock.findIndex(
        (lock) => Number(lock.StockID) === Number(this.props.DateTimeBook.stock)
      );
    const newListChoose = [];
    let DisableTime = [];
    if (indexLock > -1) {
      DisableTime = ListLock[indexLock].ListDisable;
    }
    for (let index = 0; index < 3; index++) {
      let day = moment().add(index, "days").toDate();
      if (DateChoose && index === 2) {
        day = DateChoose;
      }
      let startDate = moment(day).set(TimeOpen);
      let closeDate = moment(day).set(TimeClose);
      var duration = moment.duration(closeDate.diff(startDate));
      var MinutesTotal = duration.asMinutes();
      let newListTime = [];
      for (let minute = 0; minute <= MinutesTotal; minute += TimeNext) {
        const datetime = moment(startDate).add(minute, "minute").toDate();
        let isDayOff = false;
        if (DisableTime && DisableTime.length > 0) {
          const indexDayOf =
            DisableTime &&
            DisableTime.findIndex(
              (x) =>
                moment(x.Date).format("DD/MM/YYYY") ===
                moment(datetime).format("DD/MM/YYYY")
            );
          if (indexDayOf > -1) {
            if (
              DisableTime[indexDayOf].TimeClose &&
              DisableTime[indexDayOf].TimeClose.length > 0
            ) {
              isDayOff = DisableTime[indexDayOf].TimeClose.some((time) => {
                const DateStartDayOf = moment(DisableTime[indexDayOf].Date).set(
                  {
                    hour: time.Start.split(":")[0],
                    minute: time.Start.split(":")[1],
                  }
                );
                const DateEndDayOf = moment(DisableTime[indexDayOf].Date).set({
                  hour: time.End.split(":")[0],
                  minute: time.End.split(":")[1],
                });
                let isStart =
                  moment(datetime, "HH:mm").isSameOrAfter(
                    moment(DateStartDayOf, "HH:mm")
                  ) ||
                  moment(datetime).format("HH:mm") ===
                    moment(DateStartDayOf).format("HH:mm");
                let isEnd =
                  moment(datetime, "HH:mm").isSameOrBefore(
                    moment(DateEndDayOf, "HH:mm")
                  ) ||
                  moment(datetime).format("HH:mm") ===
                    moment(DateEndDayOf).format("HH:mm");
                return isStart && isEnd;
              });
            } else {
              isDayOff = true;
            }
          }
        }
        newListTime.push({
          Time: datetime,
          Disable: moment().diff(datetime, "minutes") > 0 || isDayOff,
        });
      }

      const TotalDisable = newListTime.filter((o) => o.Disable);
      const slideIndex =
        TotalDisable.length > 0 ? Math.floor((TotalDisable.length - 1) / 4) : 0;

      let newObj = {
        day: day,
        children: newListTime,
        childrenGroup: GroupByCount(newListTime, 4),
        slideIndex: slideIndex,
      };
      newListChoose.push(newObj);
    }
    this.setState({
      ListChoose: newListChoose,
    });
  };

  handleStock = (item) => {
    this.props.handleTime({
      ...this.props.DateTimeBook,
      stock: item.ID,
      nameStock: item.Title,
    });
    this.handleCancelDate();
  };

  handleTime = (time) => {
    this.props.handleTime({
      ...this.props.DateTimeBook,
      time: moment(time).format("HH:mm"),
    });
  };
  handleSelectDate = (datetime) => {
    const date = moment(datetime).format("DD/MM/YYYY");
    this.props.handleTime({
      ...this.props.DateTimeBook,
      date,
      time: "",
      toDate: datetime
    });
    this.getListChoose(
      datetime,
      this.state.ListDisableChoose
    );
    this.setState({
      isOpen: false,
      isActive: 2,
    });
  };

  handleCancelDate = () => {
    this.setState({
      isOpen: false,
    });
  };

  configDate = (date) => {
    const dateSplit = date.split("/");
    return dateSplit[1] + "/" + dateSplit[0] + "/" + dateSplit[2];
  };

  render() {
    const {
      arrStock,
      isLoadingStock,
      isOpen,
      indexCurrent,
      isActive,
      ListChoose,
    } = this.state;
    const { DateTimeBook } = this.props;

    const settingsIndex = {
      //wrapAround: true,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 4,
      slideIndex: indexCurrent,
      cellSpacing: 10,
      renderBottomCenterControls: () => false,
      renderCenterLeftControls: null,
      renderCenterRightControls: null,
      afterChange: (current) => {},
      beforeChange: (current, next) => {},
    };
    const settings = {
      //wrapAround: true,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 4,
      cellSpacing: 10,
      renderBottomCenterControls: () => false,
      renderCenterLeftControls: null,
      renderCenterRightControls: null,
      afterChange: (current) => {},
      beforeChange: (current, next) => {},
    };

    return (
      <div className="page-schedule__box">
        <div className="pt-8px"></div>
        <div className="page-schedule__location">
          <h5>1. Chọn spa gần bạn</h5>
          <div className="page-schedule__location-list">
            <Row>
              {isLoadingStock && <SkeletonStock />}
              {!isLoadingStock &&
                arrStock &&
                arrStock.map((item, index) => (
                  <Col width={arrStock.length > 1 ? "50" : "100"} key={index}>
                    <div className="location">
                      <div
                        className="location-item"
                        onClick={() => this.handleStock(item)}
                      >
                        <input
                          id={"location-" + item.ID}
                          type="radio"
                          name="checklocation"
                          value={item.ID}
                          checked={
                            parseInt(
                              DateTimeBook.stock && DateTimeBook.stock
                            ) === item.ID
                          }
                        />
                        <label htmlFor={"location-" + item.ID}>
                          {item.Title}
                        </label>
                        <div className="icon">
                          <img src={IconLocation} alt="Location" />
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
            </Row>
          </div>
        </div>
        <div className="page-schedule__time">
          <h5>2. Chọn thời gian</h5>
          <div className="page-schedule__date mb-15px">
            <Row>
              {ListChoose &&
                ListChoose.map((item, index) => (
                  <Col width="33" key={index}>
                    {index === ListChoose.length - 1 ? (
                      <div
                        className="date-day"
                        onClick={() => {
                          this.setState({ isOpen: true });
                        }}
                      >
                        <span className={clsx(index === isActive && "active")}>
                          {index === isActive ? DateTimeBook.date : "Ngày khác"}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="date-day"
                        onClick={() => {
                          const date = moment(item.day).format("DD/MM/YYYY");
                          this.props.handleTime({
                            ...this.props.DateTimeBook,
                            date,
                            time: "",
                            toDate: item.day
                          });
                          this.setState({ isActive: index, isOpen: false });
                        }}
                      >
                        <span className={clsx(index === isActive && "active")}>
                          {moment(item.day).calendar({
                            sameDay: (now) =>
                              `[Hôm nay] ${moment(item.day).format("DD/MM")}`,
                            nextDay: (now) =>
                              `[Ngày mai] ${moment(item.day).format("DD/MM")}`,
                          })}
                        </span>
                      </div>
                    )}
                  </Col>
                ))}
            </Row>
            <DatePicker
              theme="ios"
              cancelText="Đóng"
              confirmText="Chọn"
              headerFormat="Ngày DD/MM/YYYY"
              showCaption={true}
              dateConfig={dateConfig}
              value={
                DateTimeBook.date
                  ? new Date(this.configDate(DateTimeBook.date))
                  : new Date()
              }
              isOpen={isOpen}
              onSelect={this.handleSelectDate}
              onCancel={this.handleCancelDate}
              min={moment().subtract(1, 'days').toDate()}
            />
          </div>
          <Tabs>
            {ListChoose &&
              ListChoose.map((item, index) => (
                <Tab
                  key={index}
                  id={"tab-" + index}
                  className="page-tab-location"
                  tabActive={index === isActive}
                >
                  <div className="page-schedule__time-list mt-0">
                    <Carousel {...{ ...settings, slideIndex: item.slideIndex }}>
                      {item.childrenGroup &&
                        item.childrenGroup.map((group, groupIndex) => (
                          <div key={groupIndex}>
                            {group &&
                              group.map((time, timeIndex) => (
                                <div
                                  className="font-number mb-10px date-time-radio position-relative"
                                  key={timeIndex}
                                >
                                  <div
                                    className={clsx(
                                      "font-size-xs h-40px border rounded-sm d-flex align-items-center justify-content-center fw-600 time",
                                      time.Disable && "disabled bg-stripes",
                                      moment(time.Time).format("HH:mm") ===
                                        DateTimeBook.time &&
                                        DateTimeBook.date ===
                                          moment(item.day).format(
                                            "DD/MM/YYYY"
                                          ) &&
                                        "bg-ezs text-white"
                                    )}
                                    onClick={() =>
                                      !time.Disable &&
                                      this.handleTime(time.Time)
                                    }
                                  >
                                    {moment(time.Time).format("HH:mm A")}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ))}
                    </Carousel>
                  </div>
                </Tab>
              ))}
          </Tabs>
        </div>
        {!window.GlobalConfig?.APP?.Booking?.hideNoteWarning && (
          <div className="text-danger bg-white p-15px font-size-xs line-height-sm">
            (*) Nếu khung giờ bạn chọn đã kín lịch, chúng tôi sẽ liên hệ trực
            tiếp để thông báo.
          </div>
        )}
      </div>
    );
  }
}
