import React from "react";
import {
  Page,
  Link,
  Navbar,
  Toolbar,
  Tabs,
  Tab,
  Row,
  Col,
  Subnavbar,
  Sheet,
  Button,
} from "framework7-react";
import UserService from "../../service/user.service";
import { getUser } from "../../constants/user";
import {
  formatDateSv,
  checkDateDiff,
  formatPriceVietnamese,
} from "../../constants/format";
import OutVoucher from "../../assets/images/outvoucher.svg";
import NotificationIcon from "../../components/NotificationIcon";
import ToolBarBottom from "../../components/ToolBarBottom";
import Skeleton from "react-loading-skeleton";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import moment from "moment";
import "moment/locale/vi";
import { SERVER_APP } from "../../constants/config";
moment.locale("vi");

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      voucherAll: [],
      VoucherGood: [],
      loading: false,
      copied: false,
    };
  }
  componentDidMount() {
    this.getVoucher();
  }
  getVoucher = () => {
    const infoUser = getUser();
    if (!infoUser) return false;
    const memberid = infoUser.ID;

    this.setState({ loading: true });
    UserService.getVoucher(memberid)
      .then((response) => {
        const { danh_sach, tot_nhat } = response.data.data;
        this.setState({
          VoucherAll: danh_sach,
          VoucherGood: tot_nhat,
          loading: false,
        });
      })
      .catch((e) => console.log(e));
  };

  loadMore(done) {
    const self = this;
    setTimeout(() => {
      self.getVoucher();
      done();
    }, 1000);
  }

  render() {
    const { VoucherAll, loading, copied } = this.state;
    return (
      <Page name="voucher" ptr onPtrRefresh={this.loadMore.bind(this)}>
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">M?? gi???m gi??</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>

        <div className="page-render p-0 page-voucher">
          <div className="page-voucher__list">
            {loading &&
              Array(5)
                .fill()
                .map((item, index) => (
                  <div className="page-voucher__list-item" key={index}>
                    <div className="voucher-icon">
                      <div className="voucher-icon__text"></div>
                      <div className="voucher-icon__line"></div>
                    </div>
                    <div className="voucher-text">
                      <div className="code">
                        <span>M??</span>
                        <span>
                          <Skeleton width={60} height={20} />
                        </span>
                      </div>
                      <div className="voucher-value">
                        Gi???m t???i ??a <Skeleton width={30} />
                      </div>
                      <ul>
                        <li>
                          HSD : <Skeleton width={70} />
                        </li>
                        <li>
                          <Button className="show-more">Chi ti???t</Button>
                        </li>
                      </ul>
                    </div>
                  </div>
                ))}
            {!loading && (
              <React.Fragment>
                {VoucherAll && VoucherAll.length > 0 ? (
                  VoucherAll.slice()
                    .reverse()
                    .map((item, index) => (
                      <div className="page-voucher__list-item" key={index}>
                        <div className="voucher-icon">
                          <div className="voucher-icon__text">
                            <img
                              src={SERVER_APP + "/app/images/logo-app.png"}
                            />
                          </div>
                          <div className="voucher-icon__line"></div>
                        </div>
                        <div className="voucher-text">
                          <div className="code">
                            <span>M??</span>
                            <span>{item.aff ? item.ma_chia_se : item.ma}</span>
                          </div>
                          <div className="voucher-value">
                            Gi???m t???i ??a{" "}
                            {item.gia_tri.Phan_tram > 0
                              ? `${item.gia_tri.Phan_tram}%`
                              : `${formatPriceVietnamese(
                                  item.gia_tri.Tien
                                )} VND`}
                          </div>
                          <ul>
                            <li>
                              HSD :{" "}
                              {item.ngay === null ? (
                                "Kh??ng gi???i h???n"
                              ) : (
                                <React.Fragment>
                                  C??n <b>{checkDateDiff(item.ngay.To)}</b> ng??y
                                </React.Fragment>
                              )}
                            </li>
                            <li>
                              <Button
                                sheetOpen={`.demo-sheet-${item.Voucher.ID}`}
                                className="show-more"
                              >
                                Chi ti???t
                              </Button>
                            </li>
                          </ul>
                        </div>

                        <Sheet
                          className={`sheet-swipe-product sheet-swipe-voucher sheet-swipe-service demo-sheet-${item.Voucher.ID}`}
                          style={{
                            height: "auto",
                            "--f7-sheet-bg-color": "#fff",
                          }}
                          swipeToClose
                          swipeToStep
                          backdrop
                        >
                          <div className="sheet-modal-swipe-step">
                            <div className="sheet-modal-swipe__close"></div>
                            <div className="sheet-swipe-product__content sheet-swipe-service__content">
                              <div className="sheet-pay-head sheet-service-header">
                                <div className="title">
                                  <b>{item.ma}</b>
                                </div>
                              </div>
                              <div className="sheet-service-lst">
                                <div className="sheet-service-lst__item">
                                  <div className="item-sub">
                                    <div className="item-sub__box">
                                      <h5>B???t ?????u - K???t th??c</h5>
                                      <div className="price">
                                        {item.ngay === null
                                          ? "Kh??ng gi???i h???n"
                                          : `${moment(item.ngay.From).format(
                                              "HH:mm DD/MM/YYYY"
                                            )} - ${moment(item.ngay.To).format(
                                              "HH:mm DD/MM/YYYY"
                                            )}`}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="item-sub">
                                    <div className="item-sub__box">
                                      <h5>Gi?? tr??? gi???m gi??</h5>
                                      <div className="price">
                                        {item.gia_tri.Phan_tram > 0
                                          ? `${item.gia_tri.Phan_tram}%`
                                          : `${formatPriceVietnamese(
                                              item.gia_tri.Tien
                                            )} Vn??`}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="item-sub">
                                    <div className="item-sub__box">
                                      <h5>S??? l???n s??? d???ng / T???ng s??? l???n</h5>
                                      <div className="price">
                                        {item.gioi_han_so_lan_su_dung === -1 ? (
                                          `${item.so_lan_su_dung} / Kh??ng gi???i h???n`
                                        ) : (
                                          <>
                                            {Number(
                                              item.gioi_han_so_lan_su_dung
                                            ) <= Number(item.so_lan_su_dung)
                                              ? "H???t l?????t s??? d???ng"
                                              : `${item.so_lan_su_dung} / ${item.gioi_han_so_lan_su_dung} l???n`}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {item.so_luong_mua_tung_don ? (
                                    <div className="item-sub">
                                      <div className="item-sub__box">
                                        <h5>
                                          Gi???i h???n s??? l?????ng SP / DV tr??n c??? ????n
                                          h??ng
                                        </h5>
                                        <div className="price">
                                          {item.so_luong_mua_tung_don}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                  {item.so_luong_mua_tung_san_pham ? (
                                    <div className="item-sub">
                                      <div className="item-sub__box">
                                        <h5>
                                          Gi???i h???n s??? l?????ng tr??n t???ng SP / DV
                                        </h5>
                                        <div className="price">
                                          {item.so_luong_mua_tung_san_pham}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                  {item.aff && (
                                    <div className="item-sub">
                                      <div className="item-sub__box">
                                        <h5>M?? d??ng chia s??? cho b???n b??</h5>
                                        <div className="price flex-share">
                                          <div>{item.ma_chia_se}</div>
                                          <CopyToClipboard
                                            text={item.ma_chia_se}
                                            onCopy={() => {
                                              this.setState({ copied: true });
                                              setTimeout(() => {
                                                toast.success(
                                                  "Copy m?? th??nh c??ng !",
                                                  {
                                                    position:
                                                      toast.POSITION.TOP_LEFT,
                                                    autoClose: 1000,
                                                  }
                                                );
                                                this.setState({
                                                  copied: false,
                                                });
                                              }, 1000);
                                            }}
                                          >
                                            <div
                                              className={`code ${
                                                copied && "btn-no-click"
                                              }`}
                                            >
                                              {copied
                                                ? "??ang Copy ..."
                                                : "Copy m??"}
                                            </div>
                                          </CopyToClipboard>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="item-sub">
                                    <div className="item-sub__box">
                                      <h5>??i???u ki???n ??p d???ng</h5>
                                      <div className="price cates">
                                        {item.dieu_Kien.ap_dung === "NG"
                                          ? "Kh??ng ??p d???ng k??m ch????ng tr??nh ??u ????i."
                                          : "??p d???ng k??m ch????ng tr??nh ??u ????i."}
                                        {item.dieu_Kien.danh_muc &&
                                          item.dieu_Kien.danh_muc.length >
                                            0 && (
                                            <div>
                                              Nh??m :{" "}
                                              <span>
                                                {item.dieu_Kien.danh_muc
                                                  .length > 0
                                                  ? item.dieu_Kien.danh_muc
                                                      .map((item) => item.Title)
                                                      .join(", ")
                                                  : "T???t c???"}
                                              </span>
                                            </div>
                                          )}
                                        {item.dieu_Kien.san_pham &&
                                          item.dieu_Kien.san_pham.length >
                                            0 && (
                                            <div>
                                              S???n ph???m l??? :{" "}
                                              <span>
                                                {item.dieu_Kien.san_pham &&
                                                item.dieu_Kien.san_pham.length >
                                                  0
                                                  ? item.dieu_Kien.san_pham
                                                      .map((item) => item.Title)
                                                      .join(", ")
                                                  : "T???t c???"}
                                              </span>
                                            </div>
                                          )}

                                        {item.nhom && (
                                          <div>
                                            Nh??m kh??ch h??ng :{" "}
                                            <span>{item.nhom.Title}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {item.aff &&
                                    item.Voucher.VoucherMeta?.Perc > 0 && (
                                      <div className="item-sub">
                                        <div className="item-sub__box">
                                          <h5>Hoa h???ng gi???i thi???u</h5>
                                          <div className="price">
                                            {item.Voucher.VoucherMeta?.Perc >
                                            100
                                              ? `${formatPriceVietnamese(
                                                  item.Voucher.VoucherMeta?.Perc
                                                )}`
                                              : `${item.Voucher.VoucherMeta?.Perc}%`}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Sheet>
                      </div>
                    ))
                ) : (
                  <div className="page-voucher__out">
                    <img src={OutVoucher} alt="Kh??ng c?? m?? gi???m gi??" />
                    <div className="text">B???n ch??a c?? m?? gi???m gi?? n??o.</div>
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
