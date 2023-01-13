import { useState } from "react";
import { Link } from "framework7-react";
import React, { Fragment } from "react";
import NewsDataService from "../../../../service/news.service";
import Slider from "react-slick";
import { SERVER_APP } from "../../../../constants/config";
import clsx from "clsx";
import NumberFormat from "react-number-format";
import { getUser } from "../../../../constants/user";
import { Form, Formik } from "formik";
import { useEffect } from "react";
import * as Yup from "yup";
import BookDataService from "../../../../service/book.service";
import { toast } from "react-toastify";

const PopupConfirm = ({ show, onSubmit, onHide, initialValue, btnLoading }) => {
  const [initialValues, setInitialValues] = useState({
    Fullname: "",
    Phone: "",
  });
  const userInfo = getUser();

  useEffect(() => {
    setInitialValues((prevState) => ({
      ...prevState,
      Fullname: userInfo?.FullName || "",
      Phone: userInfo?.MobilePhone || "",
      Content: "Cần tư vấn " + initialValue?.Title,
    }));
  }, [initialValue]);

  const sendSchema = Yup.object().shape({
    Fullname: Yup.string().required("Vui lòng nhập."),
    Phone: Yup.string().required("Vui lòng nhập."),
  });

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validationSchema={sendSchema}
    >
      {(formikProps) => {
        const {
          values,
          touched,
          errors,
          handleChange,
          handleBlur,
          setFieldValue,
        } = formikProps;

        return (
          <Form className={clsx("dialog-confirm", show && "open")}>
            <div className="bg" onClick={onHide}></div>
            <div className="content">
              <div className="text">
                <h4>{initialValue?.Title}</h4>
                <div
                  className="text-desc"
                  dangerouslySetInnerHTML={{ __html: initialValue?.Desc }}
                ></div>
                {!userInfo && (
                  <div className="dialog-confirm-form">
                    <input
                      className={`dialog-confirm-input ${
                        errors.Fullname && touched.Fullname
                          ? "is-invalid solid-invalid"
                          : ""
                      }`}
                      type="text"
                      placeholder="Họ và tên"
                      name="Fullname"
                      value={values.Fullname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <NumberFormat
                      className={`dialog-confirm-input ${
                        errors.Phone && touched.Phone
                          ? "is-invalid solid-invalid"
                          : ""
                      }`}
                      value={values.Phone}
                      thousandSeparator={false}
                      placeholder="Số điện thoại"
                      onValueChange={(val) => {
                        setFieldValue(
                          "Phone",
                          val.floatValue ? val.floatValue : val.value
                        );
                      }}
                      allowLeadingZeros={true}
                    />
                  </div>
                )}
              </div>
              <div className="dialog-buttons">
                <div className="dialog-button" onClick={onHide}>
                  Đóng
                </div>
                <div className="dialog-button dialog-button-bold">
                  <button type="submit" disabled={btnLoading}>
                    {btnLoading ? "Đang gửi ..." : "Quan tâm"}
                  </button>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default class ServiceHot2 extends React.Component {
  constructor() {
    super();
    this.state = {
      width: window.innerWidth,
      isLoading: true,
      arrService: [],
      show: false,
      initialValues: null,
      btnLoading: false,
    };
  }
  componentDidMount() {
    this.getServiceHot();
  }
  handStyle = () => {
    const _width = this.state.width - 90;
    return Object.assign({
      width: _width,
    });
  };

  getServiceHot = () => {
    NewsDataService.getBannerName(this.props.id)
      .then((response) => {
        const arrService = response.data.data;
        this.setState({
          arrService: arrService,
          isLoading: false,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };
  handleUrl = (item) => {
    const userCurent = getUser();
    if (item.Link && item.Link.includes("/schedule/")) {
      const url = `${item.Link}&note=${encodeURIComponent(item.Title)}`;
      this.props.f7router.navigate(userCurent ? url : "/login/");
    } else if (item.Link && item.Link.includes("/pupup-contact/")) {
      this.setState({
        show: true,
        initialValues: item,
      });
    } else {
      this.props.f7router.navigate(item.Link);
    }
  };
  onHide = () => {
    this.setState({
      show: false,
      initialValues: null,
    });
  };
  onSubmit = (values) => {
    this.setState({
      btnLoading: true,
    });
    var p = {
      contact: {
        Fullname: values.Fullname,
        Phone1: values.Phone,
        Address: "",
        Email: "",
        Content: values.Content,
      },
    };
    BookDataService.bookContact(p)
      .then(({ data }) => {
        toast.success("Đăng ký chương trình ưu đãi thành công !", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 1000,
        });
        this.setState({
          btnLoading: false,
          show: false,
          initialValues: null,
        });
      })
      .catch((error) => console.log(error));
  };

  getColor = (index, arr) => {
    if (window.GlobalConfig?.APP?.ColorRandom && arr) {
      const { ColorRandom } = window.GlobalConfig?.APP;
      let newColorRandom = [];
      if (arr.length > ColorRandom.length) {
        const addCount = Math.floor(arr.length / ColorRandom.length);
        const surplus = arr.length % ColorRandom.length;
        for (let i = 1; i <= addCount; i++) {
          newColorRandom = [...newColorRandom, ...ColorRandom];
        }

        if (surplus > 0) {
          newColorRandom = [
            ...newColorRandom,
            ...ColorRandom.slice(0, surplus),
          ];
        }
      } else {
        newColorRandom = [...ColorRandom];
      }
      return newColorRandom[index];
    }
    return "#007bff";
  };

  render() {
    const { arrService, isLoading, initialValues, show, btnLoading } =
      this.state;
    const settingsNews = {
      className: "slider variable-width",
      dots: false,
      arrows: false,
      infinite: true,
      slidesToShow: 1,
      centerPadding: "20px",
      variableWidth: true,
      autoplay: true,
      autoplaySpeed: 7000,
      centerMode: true,
    };
    return (
      <Fragment>
        {arrService && arrService.length > 0 && (
          <div className="home-page__news mb-0 pt-8px bg-transparent">
            <div className="page-news__list">
              <div className="page-news__list-ul">
                <Slider {...settingsNews}>
                  {arrService &&
                    arrService.slice(0, 6).map((item, index) => (
                      <Link
                        className="service-hot2"
                        key={index}
                        style={this.handStyle()}
                        onClick={() => this.handleUrl(item)}
                      >
                        <div
                          className="bg"
                          style={{
                            background: this.getColor(index, arrService),
                          }}
                        ></div>
                        <div
                          className="image"
                          style={{
                            backgroundImage: `url("${SERVER_APP}/Upload/image/${item.FileName}")`,
                          }}
                        />
                        <div className="text">
                          <div>
                            <h4>{item.Title}</h4>
                            <div
                              className="text-desc"
                              dangerouslySetInnerHTML={{ __html: item.Desc }}
                            ></div>
                          </div>
                          <div className="btns">
                            <div className="btn-more">Tham gia</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </Slider>
              </div>
            </div>
          </div>
        )}
        <PopupConfirm
          initialValue={initialValues}
          show={show}
          onHide={() => this.onHide()}
          onSubmit={(values) => this.onSubmit(values)}
          btnLoading={btnLoading}
        />
      </Fragment>
    );
  }
}
