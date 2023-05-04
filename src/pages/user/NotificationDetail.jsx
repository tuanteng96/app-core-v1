import React from "react";
import {
  Page,
  Navbar,
  Link,
  Toolbar,
  Sheet,
  ListInput,
} from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import userService from "../../service/user.service";
import ReactHtmlParser from "react-html-parser";
import Skeleton from "react-loading-skeleton";
import { SET_BADGE } from "../../constants/prom21";
import { iOS } from "../../constants/helpers";
import { Form, Formik } from "formik";
import DatePicker from "react-mobile-datepicker";

import moment from "moment";
import "moment/locale/vi";
import { toast } from "react-toastify";
moment.locale("vi");

const dateConfig = {
  hour: {
    format: "hh",
    caption: "Giờ",
    step: 1,
  },
  minute: {
    format: "mm",
    caption: "Phút",
    step: 1,
  },
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

const isExpected = (title) => {
  return title && title.includes("(dự kiến)");
};

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      sheetOpened: false,
      loadingSubmit: false,
      isOpen: false,
      btnLoading: false,
      initialValues: {
        ID: 0,
        BookDate: "",
        Status: "CHUA_XAC_NHAN",
        Desc: "",
      },
      data: {},
    };
  }

  componentDidMount() {
    this.getDetialNoti();
  }

  getDetialNoti = async () => {
    const Id = this.$f7route.params.id;
    this.setState({
      isLoading: true,
    });
    try {
      const { data } = await userService.getNotiDetail(Id);
      const dataPost = new FormData();
      const dataBook =
        data?.data && data?.data.length > 0 && data.data[0].NotiData
          ? JSON.parse(data.data[0].NotiData)
          : null;

      this.setState({
        data: data.data[0],
        isLoading: false,
        initialValues: {
          ID:
            dataBook &&
            dataBook?.MemberBookIDs &&
            dataBook?.MemberBookIDs.length > 0 &&
            dataBook?.MemberBookIDs[0],
          BookDate: moment(dataBook?.Date, "YYYY-MM-DD HH:mm").toDate(),
          Status: "CHUA_XAC_NHAN",
          Desc: "",
        },
      });
      if (data.data[0] && !data.data[0].IsReaded) {
        iOS() && SET_BADGE();
        dataPost.append("ids", Id);
        if (!isExpected(data.data[0].Title)) {
          await userService.readedNotification(dataPost);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  closeSheet = () => {
    this.setState({
      sheetOpened: false,
    });
  };

  async loadRefresh(done) {
    done();
  }

  onSubmit = (values) => {
    const Id = this.$f7route.params.id;
    const { data } = this.state;

    const dataBook =
      data && data?.NotiData
        ? JSON.parse(data.NotiData)
        : null;
    
    this.setState({
      btnLoading: true,
    });
    const newDataPost = {
      MemberBook: {
        ...values,
        BookDate: values.BookDate
          ? moment(values.BookDate).format("HH:mm DD/MM/YYYY")
          : "",
        Desc:
          moment(dataBook?.Date, "YYYY-MM-DD HH:mm").format("HH:mm DD/MM/YYYY") ===
          moment(values.BookDate).format("HH:mm DD/MM/YYYY")
            ? "Khách đồng ý lịch dự kiến"
            : "Khách đổi ngày của lịch dự kiến",
      },
    };

    userService.confirmBook(newDataPost).then((response) => {
      const dataPost = new FormData();
      dataPost.append("ids", Id);

      userService.readedNotification(dataPost).then(() => {
        this.$f7router.navigate(`/`);
        toast.success("Xác nhận thành công!");
        this.setState({
          btnLoading: false,
        });
      });
    });
  };

  render() {
    const { isLoading, data, btnLoading, initialValues, isOpen } = this.state;
    return (
      <Page ptr onPtrRefresh={this.loadRefresh.bind(this)}>
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.navigate(`/notification/`)}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">
                {isLoading ? "Đang tải ..." : data && data.Title}
              </span>
            </div>

            <div className="page-navbar__noti"></div>
          </div>
        </Navbar>
        <div className="page-render no-bg p-0">
          <div className="page-noti">
            {isLoading ? (
              <ul className="page-noti__list noti-detail">
                <li className="readed">
                  <div>Ngày gửi</div>
                  <div>
                    <Skeleton count={1} />
                  </div>
                </li>
                <li className="readed">
                  <div>Tiêu đề</div>
                  <div>
                    <Skeleton count={1} />
                  </div>
                </li>
                <li className="readed">
                  <div>Nội dung</div>
                  <div>
                    <Skeleton count={3} />
                  </div>
                </li>
              </ul>
            ) : (
              <ul className="page-noti__list noti-detail">
                <li className="readed">
                  <div>Ngày gửi </div>
                  <div>{data && data.CreateDateVN}</div>
                </li>
                <li className="readed">
                  <div>Nội dung</div>
                  <div>
                    {data &&
                      data.Body &&
                      ReactHtmlParser(data.Body.replaceAll("\n", "</br>"))}
                  </div>
                </li>
              </ul>
            )}
          </div>
        </div>

        <Toolbar tabbar position="bottom">
          {data?.Link ? (
            <Link
              href={data?.Link}
              className="btn-submit-order btn-submit-order text-uppercase text-white"
            >
              <span>Xem chi tiết</span>
            </Link>
          ) : (
            <>
              {isExpected(data?.Title) && !data?.IsReaded ? (
                <Formik
                  initialValues={initialValues}
                  onSubmit={this.onSubmit}
                  enableReinitialize={true}
                >
                  {(formikProps) => {
                    const { values, touched, errors, setFieldValue } =
                      formikProps;
                    return (
                      <Form className="w-100 h-100 d--f">
                        <div
                          className="f--1 d--f fd--c jc--c px-12px"
                          onClick={() => this.setState({ isOpen: true })}
                        >
                          <div
                            className="font-size-xs"
                            style={{ lineHeight: "16px" }}
                          >
                            Thời gian thực hiện
                          </div>
                          <div className="fw-500" style={{ fontSize: "15px" }}>
                            {values?.BookDate
                              ? moment(values?.BookDate).format(
                                  "HH:mm DD-MM-YYYY"
                                )
                              : ""}
                            <i className="las la-edit font-size-lg pl-5px"></i>
                          </div>
                        </div>
                        <DatePicker
                          theme="ios"
                          cancelText="Đóng"
                          confirmText="Chọn"
                          headerFormat="hh:mm DD/MM/YYYY"
                          showCaption={true}
                          dateConfig={dateConfig}
                          value={values.BookDate ? values.BookDate : new Date()}
                          isOpen={isOpen}
                          onSelect={(date) => {
                            setFieldValue("BookDate", date);
                            this.setState({ isOpen: false });
                          }}
                          onCancel={() => this.setState({ isOpen: false })}
                        />
                        <button
                          type="submit"
                          className={`btn-submit-order btn-submit-order w-160px ${
                            btnLoading && "loading"
                          }`}
                        >
                          <span>Xác nhận</span>
                          <div className="loading-icon">
                            <div className="loading-icon__item item-1"></div>
                            <div className="loading-icon__item item-2"></div>
                            <div className="loading-icon__item item-3"></div>
                          </div>
                        </button>
                      </Form>
                    );
                  }}
                </Formik>
              ) : (
                <ToolBarBottom />
              )}
            </>
          )}
        </Toolbar>
      </Page>
    );
  }
}
