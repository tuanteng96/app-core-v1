import React from "react";
import {
  formatPriceVietnamese,
  checkImageProduct,
} from "../../constants/format";
import { AiOutlineClose } from "react-icons/ai";
import { checkSLDisabled, iOS } from "../../constants/helpers";
import imgCoupon from "../../assets/images/coupon_bg.svg";
import { getStockIDStorage, getUser } from "../../constants/user";
import ShopDataService from "./../../service/shop.service";
import { Page, Link, Navbar, Popup } from "framework7-react";
import { checkDateDiff } from "../../constants/format";
import NotificationIcon from "../../components/NotificationIcon";
import SkeletonPay from "./components/Pay/SkeletonPay";
import NumberFormat from "react-number-format";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

toast.configure();

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      dfItem: [],
      items: [],
      order: [],
      voucherSearch: "",
      deletedsOrder: [],
      editsOrder: [],
      voucherList: [],
      WalletMe: 0,
      WalletPay: 0,
      WalletPaySuccess: 0,
      popupOpened: false,
      popupWalletOpened: false,
      VCode: "",
      VDiscount: "",
      isLoading: true,
      isBtn: false,
      loadingBtn: false,
      isUpdate: false, // Trạng thái update đơn hàng
      showPreloader: false,
      Preloaders: false,
      TotalOrder: 0,
    };
  }

  setPopupOpen = () => {
    this.setState({
      popupOpened: true,
    });
  };

  setPopupClose = () => {
    this.setState({
      popupOpened: false,
      voucherSearch: "",
    });
  };

  handleApply = () => {
    const { WalletMe, WalletPay } = this.state;
    if (WalletPay > WalletMe || WalletPay === 0) {
      toast.error("Số tiền thanh toán không hợp lệ !", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
    } else {
      this.setState({
        WalletPaySuccess: WalletPay,
        popupWalletOpened: false,
      });
    }
  };

  setErr = (title) => {
    toast.error(title, {
      position: toast.POSITION.TOP_LEFT,
      autoClose: 3000,
    });
  };

  setPopupWalletOpen = () => {
    this.setState({
      popupWalletOpened: true,
    });
  };

  setPopupWalletClose = () => {
    this.setState({
      popupWalletOpened: false,
    });
  };

  delayedClick = _.debounce(() => {
    this.saveChangeCount();
  }, 800);

  TotalProduct = (data) => {
    let initialValue = 0;
    let TotalItems = data.reduce((total, currentValue) => {
      return total + currentValue.ToPay;
    }, initialValue);
    this.setState({
      TotalPay: TotalItems,
    });
  };

  IncrementItem = (ID) => {
    //Tăng
    const { items, editsOrder } = this.state;

    const indexUpdate = items.findIndex((obj) => obj.ID === ID);
    if (indexUpdate < 0) return;
    const hisQty = items[indexUpdate].Qty;
    const Price = items[indexUpdate].Price;
    const PriceOrder = items[indexUpdate].PriceOrder;
    const Qty = (items[indexUpdate].Qty = hisQty + 1);
    items[indexUpdate].ToPay =
      items[indexUpdate].Qty * (PriceOrder > 0 ? PriceOrder : Price);

    const indexEdits = editsOrder.findIndex((item) => item.ID === ID);

    let newItemEdits = [];
    if (indexEdits < 0) {
      const itemEdits = {
        ID: ID,
        Qty: Qty,
      };
      newItemEdits = [...editsOrder, itemEdits];
      this.setState({
        editsOrder: newItemEdits,
        items: items,
      });
    } else {
      editsOrder[indexEdits].Qty = Qty;
      newItemEdits = editsOrder;
      this.setState({
        editsOrder: newItemEdits,
        items: items,
      });
    }

    this.TotalProduct(items);
    this.saveChangeCount({
      ItemsEdit: newItemEdits,
    });
    //this.delayedClick();
  };

  DecreaseItem = (ID) => {
    //Giảm

    const $$this = this;
    const { items, editsOrder, deletedsOrder } = this.state;
    const indexUpdate = items.findIndex((obj) => obj.ID === ID);
    if (indexUpdate < 0) return;
    const hisQty = items[indexUpdate].Qty;
    const Price = items[indexUpdate].Price;
    const PriceOrder = items[indexUpdate].PriceOrder;

    if (hisQty === 1) {
      this.onDelete(ID);
    } else {
      const indexUpdate2 = editsOrder.findIndex((obj) => obj.ID === ID);
      const Qty = (items[indexUpdate].Qty = hisQty - 1);
      items[indexUpdate].ToPay =
        items[indexUpdate].Qty * (PriceOrder > 0 ? PriceOrder : Price);

      let newItemEdits = [];
      if (indexUpdate2 < 0) {
        const itemEdits = {
          ID: ID,
          Qty: Qty,
        };
        newItemEdits = [...editsOrder, itemEdits];
        this.setState({
          editsOrder: newItemEdits,
          items: items,
        });
      } else {
        editsOrder[indexUpdate2].Qty = Qty;
        newItemEdits = editsOrder;
        this.setState({
          editsOrder: newItemEdits,
          items: items,
        });
      }
      this.TotalProduct(items);
      this.saveChangeCount({
        ItemsEdit: newItemEdits,
      });
      //this.delayedClick();
    }
  };

  onDelete = (ID) => {
    const $$this = this;
    const { items, deletedsOrder } = this.state;
    const indexUpdate = items.findIndex((obj) => obj.ID === ID);
    const Qty = items[indexUpdate].Qty;
    if (indexUpdate < 0) return;
    $$this.$f7.dialog.confirm("Xóa sản phẩm này ?", () => {
      const itemsNew = items.filter((item) => item.ID !== ID);
      const itemDelete = {
        ID: ID,
        Qty: Qty,
      };
      let newItemDelete = [...deletedsOrder, itemDelete];

      this.setState({
        items: itemsNew,
        deletedsOrder: newItemDelete,
      });
      this.TotalProduct(itemsNew);
      this.delayedClick();
    });
  };

  componentDidMount() {
    this.getOrder();
  }

  handleVcode = (item) => {
    const { editsOrder, deletedsOrder } = this.state;
    const { Code: vcode } = item;
    if (!vcode) {
      this.setState({
        VCode: "",
        VDiscount: "",
      });
    }
    const infoUser = getUser();
    const data = {
      order: {
        ID: 0,
        SenderID: infoUser.ID,
        VCode: vcode,
      },
      addProps: "ProdTitle",
      deleteds: deletedsOrder,
      edits: editsOrder,
    };
    //if(!data.order.VCode) delete data.order.VCode;
    const self = this;
    self.$f7.preloader.show();
    ShopDataService.getUpdateOrder(data)
      .then((response) => {
        const data = response.data.data;
        if (response.data.success) {
          if (data.errors && data.errors.length > 0) {
            this.setState({
              voucherList: this.state.voucherList.filter(
                (o) => o.Code !== vcode
              ),
            });
            vcode &&
              toast.error(data.errors.join(", "), {
                position: toast.POSITION.TOP_LEFT,
                autoClose: 1500,
              });
            self.$f7.preloader.hide();
          } else {
            setTimeout(() => {
              this.TotalProduct(data.items);
              this.setState({
                dfItem: data.dfItem,
                items: data.items.reverse(),
                order: data.order,
                popupOpened: false,
                VDiscount: data.order?.Voucher?.Discount,
                VCode: vcode,
                deleteds: [],
                edits: [],
                TotalOrder: data.order?.ToPay,
              });
              self.$f7.preloader.hide();
            }, 300);
          }
        }
      })
      .catch((er) => console.log(er));
  };

  handleWalet = (value) => {
    const wallet = parseInt(value);
    if (!isNaN(parseFloat(wallet))) {
      this.setState({
        WalletPay: wallet,
      });
    } else {
      this.setState({
        WalletPay: "",
      });
    }
  };

  getOrder = () => {
    const infoUser = getUser();
    if (!infoUser) {
      this.$f7router.navigate("/login/");
      return false;
    }

    const data = {
      order: {
        ID: 0,
        SenderID: infoUser.ID,
        VCode: null,
      },
      addProps: "ProdTitle",
    };
    ShopDataService.getUpdateOrder(data)
      .then((response) => {
        const data = response.data.data;
        if (response.data.success) {
          //Total
          this.TotalProduct(data.items);
          this.setState({
            dfItem: data.dfItem,
            items: data.items.reverse(),
            order: data.order,
            isLoading: false,
            VCode: data.order && data.order?.VoucherCode,
            VDiscount: data.order?.Voucher?.Discount,
            WalletMe: data.mm,
            voucherList: data.vouchers,
            TotalOrder: data.order?.ToPay,
          });
          if (data.errors && data.errors.length > 0) {
            toast.error(data.errors.join(", "), {
              position: toast.POSITION.TOP_LEFT,
              autoClose: 1500,
            });
          }
        }
      })
      .catch((er) => console.log(er));
  };

  handlePay = () => {
    const getStock = getStockIDStorage();
    const { editsOrder, deletedsOrder, WalletPaySuccess } = this.state;
    const infoUser = getUser();
    const data = {
      order: {
        ID: 0,
        SenderID: infoUser.ID,
      },
      addProps: "ProdTitle",
      deleteds: deletedsOrder,
      edits: editsOrder,
      payed: {
        membermoney: WalletPaySuccess,
      },
      forceStockID: getStock,
      cmd: "THANH_TOAN"
    };
    this.setState({
      isBtn: true,
    });
    const self = this;
    self.$f7.preloader.show();
    ShopDataService.getUpdateOrder(data)
      .then((response) => {
        const data = response?.data?.data;
        if (response.data.success) {
          if (data.errors && data.errors.length > 0) {
            toast.error(data.errors.join(", "), {
              position: toast.POSITION.TOP_LEFT,
              autoClose: 1500,
            });
            this.setState({
              dfItem: data.dfItem,
              items: data.items.reverse(),
              order: data.order,
              deletedsOrder: [],
              editsOrder: [],
              isUpdate: false,
              voucherList: data.vouchers,
              TotalOrder: data.order?.ToPay,
              VCode: "",
            });
          } else {
            this.$f7router.navigate("/pay-info/");
          }
          self.$f7.preloader.hide();
          this.setState({
            isBtn: false,
          });
        }
      })
      .catch((er) => console.log(er));
  };

  saveChangeCount = (
    obj = {
      ItemsEdit: null,
    },
    callback
  ) => {
    const { ItemsEdit } = obj;
    const { deletedsOrder, editsOrder, items } = this.state;
    const infoUser = getUser();

    this.setState({
      isUpdate: true,
    });
    const data = {
      order: {
        ID: 0,
        SenderID: infoUser.ID,
      },
      deleteds: deletedsOrder,
      edits: ItemsEdit || editsOrder,
      addProps: "ProdTitle",
    };

    ShopDataService.getUpdateOrder(data)
      .then((response) => {
        const data = response.data.data;
        if (response.data.success) {
          this.TotalProduct(data.items);
          this.setState({
            dfItem: data.dfItem,
            items: data.items.reverse(),
            order: data.order,
            deletedsOrder: [],
            editsOrder: [],
            isUpdate: false,
            voucherList: data.vouchers,
            TotalOrder: data.order?.ToPay,
          });
          if (data.errors && data.errors.length > 0) {
            toast.error(data.errors.join(", "), {
              position: toast.POSITION.TOP_LEFT,
              autoClose: 1500,
            });
            this.setState({
              VCode: "",
            });
          }
          callback && callback();
        }
      })
      .catch((er) => {
        console.log(er);
        this.setState({
          isUpdate: false,
        });
      });
  };

  onSearchVoucher = (e) => {
    const { order, voucherSearch } = this.state;
    e.preventDefault();
    if (order.ID) {
      this.setState({
        loadingBtn: true,
      });
      const dataSubmit = {
        orderId: order.ID,
        vcode: voucherSearch,
      };
      ShopDataService.searchVoucher(dataSubmit)
        .then(({ data }) => {
          if (data.error) {
            toast.error(data.error, {
              position: toast.POSITION.TOP_LEFT,
              autoClose: 2000,
            });
            this.setState({
              loadingBtn: false,
            });
            return false;
          }
          this.handleVcode({ Code: voucherSearch });
          this.setState({
            loadingBtn: false,
          });
        })
        .catch((error) => console.log(error));
    } else {
      toast.error("Đơn hàng không tồn tại hoặc chưa có mặt hàng.", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 2000,
      });
    }
  };

  loadRefresh(done) {
    this.setState({
      Preloaders: true,
    });
    setTimeout(() => {
      this.$f7.views.main.router.navigate(this.$f7.views.main.router.url, {
        reloadCurrent: true,
      });
      this.setState({
        showPreloader: true,
        Preloaders: false,
      });
      done();
    }, 600);
  }

  render() {
    const {
      items,
      TotalPay,
      popupOpened,
      VCode,
      WalletMe,
      WalletPay,
      loadingBtn,
      popupWalletOpened,
      voucherList,
      isLoading,
      isBtn,
      VDiscount,
      Preloaders,
      TotalOrder,
    } = this.state;

    return (
      <Page
        noToolbar
        onPageBeforeOut={this.onPageBeforeOut}
        onPageBeforeRemove={this.onPageBeforeRemove}
        name="shop-pay"
        ptr
        infiniteDistance={50}
        infinitePreloader={this.state.showPreloader}
        onPtrRefresh={this.loadRefresh.bind(this)}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link
                onClick={() =>
                  this.$f7router.back({
                    force: true,
                    ignoreCache: true,
                  })
                }
              >
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Giỏ hàng</span>
            </div>
            {/* {deletedsOrder.length > 0 || editsOrder.length > 0 ? (
              <div
                className="page-navbar__save"
                onClick={() => this.saveChangeCount()}
              >
                <Link noLinkClass>
                  <i className="lar la-check-circle"></i>
                </Link>
              </div>
            ) : (
              
            )} */}
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div
          className={`${
            iOS() && Preloaders && "loader-show"
          } page-render page-render-pay no-bg p-0`}
        >
          <div className="page-pay no-bg">
            {isLoading && <SkeletonPay className="page-pay-1" />}
            {!isLoading && (
              <div className="page-pay__list page-pay-1">
                {items.length > 0
                  ? items &&
                    items.map((item, index) => (
                      <div className="page-pay__list-item" key={index}>
                        <div className="image">
                          <img
                            src={checkImageProduct(item.ProdThumb)}
                            alt={item.ProdTitle}
                          />
                        </div>
                        <div className="info">
                          <h3>{item.ProdTitle}</h3>
                          <div
                            className={
                              "info-price " +
                              (item.PriceOrder !== item.Price ? "hasSale" : "")
                            }
                          >
                            <p className="price-p">
                              {formatPriceVietnamese(item.Price)}
                              <b>₫</b>
                            </p>
                            <p className="price-s">
                              {formatPriceVietnamese(item.PriceOrder)}
                              <b>₫</b>
                            </p>
                          </div>
                          <div className="qty-form">
                            <button
                              className="reduction"
                              onClick={() => this.DecreaseItem(item.ID)}
                              disabled={checkSLDisabled(item?.ProdID).Disabled}
                            >
                              -
                            </button>
                            <div className="qty-form__count">{item.Qty}</div>
                            <button
                              className="increase"
                              onClick={() => this.IncrementItem(item.ID)}
                              disabled={checkSLDisabled(item?.ProdID).Disabled}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div
                          className="delete"
                          onClick={() => this.onDelete(item.ID)}
                        >
                          <AiOutlineClose />
                        </div>
                      </div>
                    ))
                  : "Chưa có đơn hàng"}
              </div>
            )}
            <div className="page-pay__total">
              <ul>
                <li className="voucher">
                  <div className="title">
                    <svg
                      width={18}
                      height={18}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 -2 23 22"
                    >
                      <g filter="url(#voucher-filter0_d)">
                        <mask id="voucher-mask0_d" fill="#fff">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1 2h18v2.32a1.5 1.5 0 000 2.75v.65a1.5 1.5 0 000 2.75v.65a1.5 1.5 0 000 2.75V16H1v-2.12a1.5 1.5 0 000-2.75v-.65a1.5 1.5 0 000-2.75v-.65a1.5 1.5 0 000-2.75V2z"
                          />
                        </mask>
                        <path
                          d="M19 2h1V1h-1v1zM1 2V1H0v1h1zm18 2.32l.4.92.6-.26v-.66h-1zm0 2.75h1v-.65l-.6-.26-.4.91zm0 .65l.4.92.6-.26v-.66h-1zm0 2.75h1v-.65l-.6-.26-.4.91zm0 .65l.4.92.6-.26v-.66h-1zm0 2.75h1v-.65l-.6-.26-.4.91zM19 16v1h1v-1h-1zM1 16H0v1h1v-1zm0-2.12l-.4-.92-.6.26v.66h1zm0-2.75H0v.65l.6.26.4-.91zm0-.65l-.4-.92-.6.26v.66h1zm0-2.75H0v.65l.6.26.4-.91zm0-.65l-.4-.92-.6.26v.66h1zm0-2.75H0v.65l.6.26.4-.91zM19 1H1v2h18V1zm1 3.32V2h-2v2.32h2zm-.9 1.38c0-.2.12-.38.3-.46l-.8-1.83a2.5 2.5 0 00-1.5 2.29h2zm.3.46a.5.5 0 01-.3-.46h-2c0 1.03.62 1.9 1.5 2.3l.8-1.84zm.6 1.56v-.65h-2v.65h2zm-.9 1.38c0-.2.12-.38.3-.46l-.8-1.83a2.5 2.5 0 00-1.5 2.29h2zm.3.46a.5.5 0 01-.3-.46h-2c0 1.03.62 1.9 1.5 2.3l.8-1.84zm.6 1.56v-.65h-2v.65h2zm-.9 1.38c0-.2.12-.38.3-.46l-.8-1.83a2.5 2.5 0 00-1.5 2.29h2zm.3.46a.5.5 0 01-.3-.46h-2c0 1.03.62 1.9 1.5 2.3l.8-1.84zM20 16v-2.13h-2V16h2zM1 17h18v-2H1v2zm-1-3.12V16h2v-2.12H0zm1.4.91a2.5 2.5 0 001.5-2.29h-2a.5.5 0 01-.3.46l.8 1.83zm1.5-2.29a2.5 2.5 0 00-1.5-2.3l-.8 1.84c.18.08.3.26.3.46h2zM0 10.48v.65h2v-.65H0zM.9 9.1a.5.5 0 01-.3.46l.8 1.83A2.5 2.5 0 002.9 9.1h-2zm-.3-.46c.18.08.3.26.3.46h2a2.5 2.5 0 00-1.5-2.3L.6 8.65zM0 7.08v.65h2v-.65H0zM.9 5.7a.5.5 0 01-.3.46l.8 1.83A2.5 2.5 0 002.9 5.7h-2zm-.3-.46c.18.08.3.26.3.46h2a2.5 2.5 0 00-1.5-2.3L.6 5.25zM0 2v2.33h2V2H0z"
                          mask="url(#voucher-mask0_d)"
                        />
                      </g>
                      <path
                        clipRule="evenodd"
                        d="M6.49 14.18h.86v-1.6h-.86v1.6zM6.49 11.18h.86v-1.6h-.86v1.6zM6.49 8.18h.86v-1.6h-.86v1.6zM6.49 5.18h.86v-1.6h-.86v1.6z"
                      />
                      <defs>
                        <filter
                          id="voucher-filter0_d"
                          x={0}
                          y={1}
                          width={20}
                          height={16}
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood
                            floodOpacity={0}
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          />
                          <feOffset />
                          <feGaussianBlur stdDeviation=".5" />
                          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0" />
                          <feBlend
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow"
                          />
                          <feBlend
                            in="SourceGraphic"
                            in2="effect1_dropShadow"
                            result="shape"
                          />
                        </filter>
                      </defs>
                    </svg>
                    <span>Voucher</span>
                  </div>
                  <div className="box">
                    <div className="box-text">
                      {!VCode || VCode === "" ? (
                        <div
                          onClick={
                            items.length > 0
                              ? () => this.setPopupOpen()
                              : () =>
                                  this.setErr(
                                    "Giỏ hàng trống. Vui lòng đặt hàng."
                                  )
                          }
                        >
                          <span>Chọn hoặc nhập mã</span>
                          <svg
                            enableBackground="new 0 0 11 11"
                            viewBox="0 0 11 11"
                            className="stardust-icon stardust-icon-arrow-right ekGwAM"
                          >
                            <path
                              stroke="none"
                              d="m2.5 11c .1 0 .2 0 .3-.1l6-5c .1-.1.2-.3.2-.4s-.1-.3-.2-.4l-6-5c-.2-.2-.5-.1-.7.1s-.1.5.1.7l5.5 4.6-5.5 4.6c-.2.2-.2.5-.1.7.1.1.3.2.4.2z"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="box-vocher-checked">
                          <span
                            className="vcode"
                            onClick={
                              items.length > 0
                                ? () => this.setPopupOpen()
                                : () =>
                                    this.setErr(
                                      "Giỏ hàng trống. Vui lòng đặt hàng."
                                    )
                            }
                          >
                            (
                            {VDiscount && Number(VDiscount) < 100
                              ? `- ${VDiscount}%`
                              : `- ${formatPriceVietnamese(VDiscount)}đ`}
                            ) {VCode}
                          </span>
                          <AiOutlineClose
                            onClick={() => this.handleVcode({ Code: "" })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
                {/* <li className="wallet">
                  <div className="title">
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="_2-S23g"
                    >
                      <path
                        d="M17.35 9C17.35 13.6116 13.6116 17.35 9 17.35C4.38842 17.35 0.65 13.6116 0.65 9C0.65 4.38842 4.38842 0.65 9 0.65C13.6116 0.65 17.35 4.38842 17.35 9Z"
                        stroke="#FFA600"
                        strokeWidth="1.3"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.86071 4.72259C6.17747 5.29925 5.86228 6.34975 6.11015 7.18667C6.32493 7.91199 6.96053 8.4448 7.63192 8.79523C8.00147 8.9881 8.40198 9.15031 8.80859 9.25808C8.90865 9.28464 9.00893 9.309 9.10812 9.33858C9.20708 9.3681 9.30524 9.39993 9.40253 9.43384C9.46387 9.45524 9.5244 9.4784 9.58533 9.50057C9.60195 9.50666 9.69246 9.54243 9.62439 9.51522C9.55449 9.48729 9.6962 9.54567 9.71173 9.55237C9.99803 9.67605 10.2729 9.82119 10.5313 9.99195C10.6458 10.0676 10.5774 10.0165 10.6832 10.1034C10.7405 10.1504 10.7967 10.1984 10.8507 10.2489C10.9045 10.2993 10.956 10.3518 11.0057 10.4059C11.0917 10.4995 11.0512 10.4483 11.1192 10.5524C11.2986 10.8273 11.364 11.0304 11.3537 11.3518C11.3432 11.6797 11.2139 12.011 11.0294 12.2188C10.5583 12.7491 9.79735 12.9482 9.09489 12.9149C8.59692 12.8912 8.05251 12.7874 7.60822 12.6078C7.15828 12.4261 6.75616 12.1464 6.36567 11.8709C6.11567 11.6946 5.72339 11.8315 5.57846 12.0678C5.40729 12.3469 5.53427 12.6418 5.7849 12.8185C6.53781 13.3496 7.32405 13.7643 8.25889 13.916C9.14449 14.0597 9.99009 14.0398 10.8225 13.6919C11.6025 13.3658 12.2381 12.7255 12.4288 11.9204C12.6275 11.0819 12.4057 10.2759 11.8194 9.62985C11.1364 8.87715 10.0972 8.46072 9.11336 8.19958C8.9946 8.16802 8.87763 8.13016 8.7621 8.08923C8.69772 8.06645 8.63385 8.04247 8.57045 8.01745C8.69173 8.06536 8.52551 7.99709 8.4918 7.98206C8.34755 7.91786 8.20619 7.84746 8.06954 7.76959C7.47629 7.43163 7.11548 7.04773 7.19816 6.40127C7.30253 5.58492 7.95476 5.17968 8.75267 5.12075C9.56082 5.06099 10.4006 5.2559 11.0497 5.67546C11.6643 6.0728 12.2408 5.12234 11.6305 4.72786C10.3007 3.86821 8.12633 3.65448 6.86071 4.72259Z"
                        fill="#FFA600"
                        stroke="#FFA600"
                        strokeWidth="0.2"
                      />
                    </svg>
                    <span>
                      Ví (
                      <span>
                        {formatPriceVietnamese(WalletMe)}
                        <b>₫</b>
                      </span>
                      )
                    </span>
                  </div>
                  <div className="box">
                    <div className="box-text">
                      {WalletPaySuccess === 0 ? (
                        <div
                          onClick={
                            items.length > 0
                              ? () => this.setPopupWalletOpen()
                              : () =>
                                  this.setErr(
                                    "Giỏ hàng trống. Vui lòng đặt hàng."
                                  )
                          }
                        >
                          <span>Nhập số tiền</span>
                          <svg
                            enableBackground="new 0 0 11 11"
                            viewBox="0 0 11 11"
                            className="stardust-icon stardust-icon-arrow-right ekGwAM"
                          >
                            <path
                              stroke="none"
                              d="m2.5 11c .1 0 .2 0 .3-.1l6-5c .1-.1.2-.3.2-.4s-.1-.3-.2-.4l-6-5c-.2-.2-.5-.1-.7.1s-.1.5.1.7l5.5 4.6-5.5 4.6c-.2.2-.2.5-.1.7.1.1.3.2.4.2z"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="box-vocher-checked">
                          <span
                            className="vcode"
                            onClick={() => this.setPopupWalletOpen()}
                          >
                            -{formatPriceVietnamese(WalletPaySuccess)}
                            <b>₫</b>
                          </span>
                          <AiOutlineClose
                            onClick={() =>
                              this.setState({
                                WalletPaySuccess: 0,
                                WalletPay: 0,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </li> */}
                <li className="total">
                  <div className="title">
                    Tổng tiền :
                    <span>
                      {formatPriceVietnamese(TotalOrder)}
                      <b>₫</b>
                    </span>
                  </div>
                  <div className="btns">
                    <button
                      className={`btn-small ${
                        items.length > 0 ? "" : "disabled-btn"
                      } ${isBtn && "loading"}`}
                      onClick={this.handlePay}
                      type="button"
                    >
                      <span>Thanh toán</span>
                      <div className="loader">
                        <div className="loader-item"></div>
                        <div className="loader-item"></div>
                        <div className="loader-item"></div>
                      </div>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <Popup
          className="voucher-popup-swipe"
          opened={popupOpened}
          onPopupClosed={() => this.setPopupClose()}
          // swipeToClose
        >
          <div className="voucher-popup-swipe__close"></div>
          <div className="head">
            <div className="head-title">Mã khuyến mãi</div>
            <div className="head-close" onClick={() => this.setPopupClose()}>
              <i className="las la-times"></i>
            </div>
          </div>
          <div className="body">
            <form className="form-voucher" onSubmit={this.onSearchVoucher}>
              <input
                type="text"
                placeholder="Nhập mã"
                onChange={(evt) =>
                  this.setState({
                    voucherSearch: evt.target.value.toUpperCase(),
                  })
                }
              />
              <button
                className={`btn-submit-order ${loadingBtn && "loading"}`}
                type="submit"
              >
                <span>Thêm mã</span>
                <div className="loading-icon">
                  <div className="loading-icon__item item-1"></div>
                  <div className="loading-icon__item item-2"></div>
                </div>
              </button>
            </form>
            {voucherList.length === 0 ? (
              <ul>
                <li>Bạn không có mã khuyến mại.</li>
              </ul>
            ) : (
              ""
            )}
            <ul>
              {voucherList &&
                voucherList
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <li
                      key={index}
                      style={{
                        backgroundImage: `url(${imgCoupon})`,
                      }}
                    >
                      <div className="coupon">
                        <div className="coupon-title">
                          Mã <span>{item.Code}</span>
                        </div>
                        <div className="coupon-value">
                          Ưu đãi
                          <span>
                            {item.Discount > 100
                              ? `${formatPriceVietnamese(item.Discount)} Vnd`
                              : `${item.Discount} %`}
                          </span>
                        </div>
                        <div className="coupon-end">
                          HSD :{" "}
                          {item.EndDate === null
                            ? "Không giới hạn"
                            : `Còn ${checkDateDiff(item.EndDate)} ngày`}
                        </div>
                      </div>
                      <div
                        onClick={() => this.handleVcode(item)}
                        className="apply-coupon"
                      >
                        Chọn mã
                      </div>
                    </li>
                  ))}
            </ul>
          </div>
        </Popup>

        <Popup
          className="voucher-popup-swipe wallet-popup-swipe"
          opened={popupWalletOpened}
          onPopupClosed={() => this.setPopupWalletClose()}
          swipeToClose
        >
          <div className="voucher-popup-swipe__close"></div>
          <div className="head">
            <div className="head-title">Thanh toán ví</div>
            <div
              className="head-close"
              onClick={() => this.setPopupWalletClose()}
            >
              <i className="las la-times"></i>
            </div>
          </div>
          <div className="body">
            <div className="body-wallet">
              Số dư ví của bạn :{" "}
              <span>
                {formatPriceVietnamese(WalletMe)}
                <b>₫</b>
              </span>
            </div>
            {WalletMe <= 0 && (
              <div className="body-wallet--error">
                Số tiền trong ví của bạn đã hết. Vui lòng nạp tiền vào ví để có
                thể sử dụng ví thanh toán.
              </div>
            )}
            <div className="body-wallet--form">
              <NumberFormat
                value={WalletPay && WalletPay > 0 ? WalletPay : ""}
                thousandSeparator={true}
                placeholder="Nhập số tiền ..."
                onValueChange={(val) => {
                  this.handleWalet(val.floatValue ? val.floatValue : val.value);
                }}
              />
              <button
                className={`${WalletMe > 0 ? "" : "btn-no-click"}`}
                onClick={() => this.handleApply()}
                type="button"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </Popup>
      </Page>
    );
  }
}
