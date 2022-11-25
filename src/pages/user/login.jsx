import React, { Fragment } from "react";
import { SERVER_APP } from "./../../constants/config";
import {
  delete_cookie,
  getUserLoginStorage,
  setStockIDStorage,
  setStockNameStorage,
  setUserLoginStorage,
  setUserStorage,
} from "../../constants/user";
import { Page, Link, Toolbar } from "framework7-react";
import UserService from "../../service/user.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setSubscribe } from "../../constants/subscribe";
import { iOS } from "../../constants/helpers";
import { OPEN_QRCODE, SEND_TOKEN_FIREBASE } from "../../constants/prom21";
import { ref, set } from "firebase/database";
import { database } from "../../firebase/firebase";

toast.configure();

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      username: getUserLoginStorage().username,
      password: getUserLoginStorage().password,
      arrNews: [],
      arrBanner: [],
    };
  }

  loginSubmit = () => {
    const { username, password } = this.state;
    if (username === "" || password === "") {
      toast.error("Vui lòng nhập tài khoản & mật khẩu !", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
      return;
    }
    const self = this;
    self.$f7.preloader.show();
    UserService.login(username, password)
      .then((response) => {
        if (response.data.error) {
          self.$f7.preloader.hide();
          toast.error("Tài khoản & mật khẩu không chính xác !", {
            position: toast.POSITION.TOP_LEFT,
            autoClose: 3000,
          });
          this.setState({
            password: "",
          });
        } else {
          const userData = response.data;
          const token = userData.token;
          setUserStorage(token, userData);
          SEND_TOKEN_FIREBASE().then(async (response) => {
            if (!response.error && response.Token) {
              await UserService.authSendTokenFirebase({
                Token: response.Token,
                ID: userData.ID,
                Type: userData.acc_type,
              });
              setTimeout(() => {
                self.$f7.preloader.hide();
                this.$f7router.navigate("/", {
                  animate: true,
                  transition: "f7-flip",
                });
              }, 300);
            } else {
              setSubscribe(userData, () => {
                setTimeout(() => {
                  self.$f7.preloader.hide();
                  this.$f7router.navigate("/", {
                    animate: true,
                    transition: "f7-flip",
                  });
                }, 300);
              });
            }
            userData?.ByStockID && setStockIDStorage(userData.ByStockID);
            userData?.StockName && setStockNameStorage(userData.StockName);
            setUserLoginStorage(username, password);
          });
        }
      })
      .catch((e) => console.log(e));
  };

  handleChangeInput = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  onFind(value) {
    this.setState({ value, watching: false });
  }

  openQRCode = () => {
    var self = this;
    OPEN_QRCODE()
      .then((response) => {
        this.setState({ Code: response.data });
        const qrcode = iOS() ? response.data?.split('"')[1] : response.data;
        const qrcodeLogin = qrcode.split("&")[0];
        const qrcodeStock = qrcode.split("&")[1];
        self.$f7.dialog.preloader(`Đang xử lý ...`);
        UserService.QRCodeLogin(qrcodeLogin)
          .then(({ data }) => {
            if (data.error) {
              toast.error("Mã QR Code không hợp lệ hoặc hết hạn.", {
                position: toast.POSITION.TOP_LEFT,
                autoClose: 3000,
              });
              self.$f7.dialog.close();
            } else {
              setUserStorage(data.token, data);
              SEND_TOKEN_FIREBASE().then(async (response) => {
                if (!response.error && response.Token) {
                  await UserService.authSendTokenFirebase({
                    Token: response.Token,
                    ID: data.ID,
                    Type: data.acc_type,
                  });
                  set(
                    ref(database, `/qrcode/${qrcodeStock}/${qrcodeLogin}`),
                    null
                  ).then(() => {
                    self.$f7.dialog.close();
                    this.$f7router.navigate("/", {
                      animate: true,
                      transition: "f7-flip",
                    });
                  });
                } else {
                  setSubscribe(data, () => {
                    set(
                      ref(database, `/qrcode/${qrcodeStock}/${qrcodeLogin}`),
                      null
                    ).then(() => {
                      self.$f7.dialog.close();
                      this.$f7router.navigate("/", {
                        animate: true,
                        transition: "f7-flip",
                      });
                    });
                  });
                }
              });
              data?.ByStockID && setStockIDStorage(data.ByStockID);
              data?.StockName && setStockNameStorage(data.StockName);
            }
          })
          .catch((err) => self.$f7.dialog.close());
      })
      .catch((error) => console.log(error));
  };

  render() {
    const { isLoading, password, username } = this.state;
    return (
      <Page noNavbar noToolbar name="login">
        <div
          className={`page-wrapper page-login ${iOS() && "page-login-iphone"}`}
        >
          <div className="page-login__back">
            <Link
              onClick={() => {
                if (
                  this.$f7router.history[
                    this.$f7router.history.length - 2
                  ]?.indexOf("/profile/") > -1
                ) {
                  this.$f7router.navigate(`/`);
                } else {
                  this.$f7router.back();
                }
              }}
            >
              <i className="las la-arrow-left"></i>
            </Link>
          </div>
          <div className="page-login__content">
            <div className="page-login__logo">
              <div className="logo">
                <img src={SERVER_APP + "/app/images/logo-app.png"} />
              </div>
              <div className="title">Xin chào, Bắt đầu đăng nhập nào</div>
            </div>
            <div className="page-login__form">
              <form>
                <div className="title">Đăng nhập tài khoản</div>
                <div className="page-login__form-item">
                  <input
                    type="text"
                    value={username}
                    name="username"
                    autoComplete="off"
                    onChange={this.handleChangeInput}
                    placeholder="Số điện thoại hoặc Email"
                  />
                  {username && (
                    <div
                      className="clear-value"
                      onClick={() => {
                        delete_cookie("USN");
                        delete_cookie("PWD");
                        this.setState({ username: "" });
                      }}
                    >
                      <i className="las la-times"></i>
                    </div>
                  )}
                </div>
                <div className="page-login__form-item">
                  <input
                    type="password"
                    value={password}
                    name="password"
                    autoComplete="off"
                    onChange={this.handleChangeInput}
                    placeholder="Mật khẩu"
                  />
                  {password && (
                    <div
                      className="clear-value"
                      onClick={() => {
                        delete_cookie("PWD");
                        this.setState({ password: "" });
                      }}
                    >
                      <i className="las la-times"></i>
                    </div>
                  )}
                </div>
                <div className="page-login__form-item">
                  <button
                    type="button"
                    onClick={() => this.loginSubmit()}
                    className={
                      "btn-login btn-me" +
                      (isLoading === true ? " loading" : "")
                    }
                  >
                    <span>Đăng nhập</span>
                  </button>
                  <div className="or">
                    <button
                      className="btn-qr"
                      type="button"
                      onClick={() => this.openQRCode()}
                    >
                      <i className="las la-qrcode"></i>
                    </button>
                  </div>
                  <div className="forgot">
                    <Link href="/forgot/">Quên mật khẩu ?</Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="page-login__alert">
            <div className="ft">
              Bạn chưa có tài khoản ? <Link href="/registration/">Đăng ký</Link>
            </div>
          </div>
        </div>
      </Page>
    );
  }
}
