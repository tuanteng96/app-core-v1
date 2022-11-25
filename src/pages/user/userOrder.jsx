import React from "react";
import {
  Page,
  Link,
  Toolbar,
  Navbar,
  Sheet,
  Button,
  PageContent,
} from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import UserService from "../../service/user.service";
import NotificationIcon from "../../components/NotificationIcon";
import { getUser, getPassword } from "../../constants/user";
import PageNoData from "../../components/PageNoData";
import {
  formatPriceVietnamese,
  checkImageProduct,
} from "../../constants/format";
import Skeleton from "react-loading-skeleton";
import ReactHtmlParser from "react-html-parser";
import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      arrOder: [],
      loading: false,
      loadingText: false,
      textPay: "",
    };
  }
  componentDidMount() {
    this.getOrderAll();

    this.setState({
      loadingText: true,
    });
    UserService.getConfig("App.thanhtoan")
      .then(({ data }) => {
        this.setState({
          textPay: data.data && data.data[0]?.ValueLines,
          loadingText: false,
        });
      })
      .catch((error) => console.log(error));
  }

  getOrderAll = () => {
    this.setState(() => ({ loading: true }));
    UserService.getOrderAll2()
      .then((response) => {
        const data = response.data;
        this.setState({
          arrOder: data,
          loading: false,
        });
      })
      .catch((er) => console.log(er));
  };

  formatDateFull = (data) => {
    const dateSplit = data.split("T");
    return dateSplit[1] + " " + dateSplit[0];
  };

  checkStatus = (item) => {
    if (item.Status === "finish") {
      return "success";
    }
    if (item.Status === "cancel" && item.IsReturn !== 0) {
      return "primary";
    }
    if (item.Status === "cancel") {
      return "danger";
    }
    return "warning";
  };

  async loadRefresh(done) {
    await this.getOrderAll();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    done();
  }

  render() {
    const { arrOder, loading, loadingText, textPay } = this.state;
    return (
      <Page
        onPtrRefresh={this.loadRefresh.bind(this)}
        ptr
        infiniteDistance={50}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Đơn hàng</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="page-render no-bg p-0">
          <div className="page-order">
            <div className="page-order__list">
              {loading &&
                Array(5)
                  .fill()
                  .map((item, index) => (
                    <Link key={index} href="" noLinkClass className="item">
                      <div className="item-header">
                        <i className="las la-dolly"></i>
                        <div className="text">
                          <div className="date">
                            <Skeleton width={60} />
                          </div>
                          <div className={`status`}>
                            <Skeleton width={60} />
                          </div>
                        </div>
                      </div>
                      <div className="item-body">
                        <div className="list-sub">
                          {Array(index + 2)
                            .fill()
                            .map((sub, idx) => (
                              <div className="list-sub-item" key={idx}>
                                <div className="img">
                                  <Skeleton width={60} height={60} />
                                </div>
                                <div className="text">
                                  <Skeleton count={2} />
                                  <div className="text-count">
                                    <Skeleton width={70} />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="item-footer">
                        <div className="content-item">
                          <span>Tổng đơn hàng :</span>
                          <span className="price text-red">
                            <Skeleton width={60} />
                          </span>
                        </div>
                        <div className="content-item">
                          <span>Đã thanh toán :</span>
                          <span className="price">
                            <Skeleton width={60} />
                          </span>
                          <span className="px">,</span>
                          <span>Còn nợ :</span>
                          <span className="price">
                            <Skeleton width={60} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
              {!loading && arrOder.length > 0 ? (
                arrOder &&
                arrOder.map((item, index) => (
                  <Link key={index} href="" noLinkClass className="item">
                    <div className="item-header">
                      <i className="las la-dolly"></i>
                      <div className="text">
                        <div className="date">
                          {this.formatDateFull(item.OrderDate)}
                        </div>
                        <div className={`status ` + this.checkStatus(item)}>
                          {item.IsReturn !== 0 && item.Status === "cancel"
                            ? "Trả lại"
                            : item.StatusText}
                        </div>
                      </div>
                    </div>
                    <div className="item-body">
                      <div className="list-sub">
                        {item.Items &&
                          item.Items.map((sub, idx) => (
                            <div className="list-sub-item" key={idx}>
                              <div className="img">
                                <img src={checkImageProduct(sub.ProdThumb)} />
                              </div>
                              <div className="text">
                                <div className="text-name">{sub.ProdTitle}</div>
                                <div className="text-count">
                                  SL <b>x{sub.Qty}</b>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="item-footer">
                      <div className="content-item">
                        <span>Tổng đơn hàng :</span>
                        <span className="price text-red">
                          {formatPriceVietnamese(item.ToPay)}
                          <b>₫</b>
                        </span>
                      </div>
                      {item.Status !== "cancel" && (
                        <div className="content-item">
                          {/* <span>Đã thanh toán :</span>
                          <span className="price">
                            {formatPriceVietnamese(item.Payed)}
                            <b>₫</b>
                          </span> */}
                          {item.Status === "finish" && (
                            <React.Fragment>
                              {item.thanhtoan.thanh_toan_tien > 0 && (
                                <React.Fragment>
                                  <span className="px">,</span>
                                  <span>Thanh toán thực tế :</span>
                                  <span className="price">
                                    {formatPriceVietnamese(
                                      Math.abs(item.thanhtoan.thanh_toan_tien)
                                    )}
                                    <b>₫</b>
                                  </span>
                                </React.Fragment>
                              )}
                              {item.thanhtoan.thanh_toan_vi > 0 && (
                                <React.Fragment>
                                  <span className="px">,</span>
                                  <span>Thanh toán ví :</span>
                                  <span className="price">
                                    {formatPriceVietnamese(
                                      Math.abs(item.thanhtoan.thanh_toan_vi)
                                    )}
                                    <b>₫</b>
                                  </span>
                                </React.Fragment>
                              )}
                              {item.thanhtoan.hoan_vi_tra_hang > 0 && (
                                <React.Fragment>
                                  <span className="px">,</span>
                                  <span>Hoàn ví khi trả hàng :</span>
                                  <span className="price">
                                    {formatPriceVietnamese(
                                      Math.abs(item.thanhtoan.hoan_vi_tra_hang)
                                    )}
                                    <b>₫</b>
                                  </span>
                                </React.Fragment>
                              )}
                              {item.thanhtoan.hoan_vi_ket_thuc_the > 0 && (
                                <React.Fragment>
                                  <span className="px">,</span>
                                  <span>Hoàn ví khi kết thúc thẻ :</span>
                                  <span className="price">
                                    {formatPriceVietnamese(
                                      Math.abs(
                                        item.thanhtoan.hoan_vi_ket_thuc_the
                                      )
                                    )}
                                    <b>₫</b>
                                  </span>
                                </React.Fragment>
                              )}
                              {item.thanhtoan.ket_thuc_the_hoan_tien > 0 && (
                                <React.Fragment>
                                  <span className="px">,</span>
                                  <span>Kết thúc thẻ hoàn tiền :</span>
                                  <span className="price">
                                    {formatPriceVietnamese(
                                      Math.abs(
                                        item.thanhtoan.ket_thuc_the_hoan_tien
                                      )
                                    )}
                                    <b>₫</b>
                                  </span>
                                </React.Fragment>
                              )}
                              {item.thanhtoan.ket_thuc_the_hoan_vi > 0 && (
                                <React.Fragment>
                                  <span className="px">,</span>
                                  <span>Kết thúc thẻ hoàn ví :</span>
                                  <span className="price">
                                    {formatPriceVietnamese(
                                      Math.abs(
                                        item.thanhtoan.ket_thuc_the_hoan_vi
                                      )
                                    )}
                                    <b>₫</b>
                                  </span>
                                </React.Fragment>
                              )}
                              {/* {item.thanhtoan.thanh_toan_ao > 0 && (
                                <React.Fragment>
                                  <span className="px">,</span>
                                  <span>Thanh toán ảo :</span>
                                  <span className="price">
                                    {formatPriceVietnamese(
                                      Math.abs(item.thanhtoan.thanh_toan_ao)
                                    )}
                                    <b>₫</b>
                                  </span>
                                </React.Fragment>
                              )} */}
                              {item.thanhtoan.tra_hang_hoan_tien > 0 && (
                                <React.Fragment>
                                  <span className="px">,</span>
                                  <span>Trả hàng hoàn tiền :</span>
                                  <span className="price">
                                    {formatPriceVietnamese(
                                      Math.abs(
                                        item.thanhtoan.tra_hang_hoan_tien
                                      )
                                    )}
                                    <b>₫</b>
                                  </span>
                                </React.Fragment>
                              )}
                              {item.thanhtoan.tra_hang_hoan_vi > 0 && (
                                <React.Fragment>
                                  <span className="px">,</span>
                                  <span>Trả hàng ví :</span>
                                  <span className="price">
                                    {formatPriceVietnamese(
                                      Math.abs(item.thanhtoan.tra_hang_hoan_vi)
                                    )}
                                    <b>₫</b>
                                  </span>
                                </React.Fragment>
                              )}
                              <span className="px">,</span>
                            </React.Fragment>
                          )}
                          <span>Còn nợ :</span>
                          <span className="price">
                            {formatPriceVietnamese(
                              Math.abs(
                                item.thanhtoan.tong_gia_tri_dh -
                                  item.thanhtoan.thanh_toan_tien -
                                  item.thanhtoan.thanh_toan_vi -
                                  item.thanhtoan.thanh_toan_ao
                              )
                            )}
                            <b>₫</b>
                          </span>
                          <div className="btn-div">
                            {Math.abs(
                              item.thanhtoan.tong_gia_tri_dh -
                                item.thanhtoan.thanh_toan_tien -
                                item.thanhtoan.thanh_toan_vi -
                                item.thanhtoan.thanh_toan_ao
                            ) > 0 && (
                              <Button
                                sheetOpen={`.demo-sheet-${item.ID}`}
                                className="show-more"
                              >
                                Thanh toán
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      <Sheet
                        className={`demo-sheet-${item.ID} sheet-detail sheet-detail-order`}
                        style={{
                          height: "auto !important",
                          "--f7-sheet-bg-color": "#fff",
                        }}
                        swipeToClose
                        backdrop
                      >
                        <Button
                          sheetClose={`.demo-sheet-${item.ID}`}
                          className="show-more"
                        >
                          <i className="las la-times"></i>
                        </Button>
                        <PageContent>
                          <div className="page-shop__service-detail">
                            <div className="title">
                              <h4>Thanh toán đơn hàng #{item.ID}</h4>
                            </div>
                            <div className="content">
                              {loadingText && <Skeleton count={6} />}
                              {!loadingText &&
                                textPay &&
                                ReactHtmlParser(
                                  textPay
                                    .replaceAll("ID_ĐH", `#${item.ID}`)
                                    .replaceAll(
                                      "MONEY",
                                      `${formatPriceVietnamese(
                                        Math.abs(item.RemainPay)
                                      )} ₫`
                                    )
                                    .replaceAll("ID_DH", `${item.ID}`)
                                )}
                            </div>
                          </div>
                        </PageContent>
                      </Sheet>
                    </div>
                  </Link>
                ))
              ) : (
                <PageNoData text="Đơn hàng của bạn trống. Vui lòng đặt hàng." />
              )}
            </div>
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
