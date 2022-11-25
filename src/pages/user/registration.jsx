import React from "react";
import { SERVER_APP } from "./../../constants/config";
import { Page, Link, Toolbar } from "framework7-react";
import UserService from "../../service/user.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getStockIDStorage } from "../../constants/user";
import SelectStock from "../../components/SelectStock";

toast.configure();
export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      fullname: "",
      password: "",
      phone: "",
      arrNews: [],
      arrBanner: [],
      isOpenStock: false,
      isReload: 0,
    };
  }
  componentDidMount() {

  }
  registrationSubmit = () => {
    const fullname = this.state.fullname;
    const password = this.state.password;
    const phone = this.state.phone;
    const stockId = getStockIDStorage();

    if (!stockId) {
      this.setState({
        isOpenStock: !this.state.isOpenStock,
      });
      return;
    }

    const phone_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (fullname === "" || password === "" || phone === "") {
      toast.error("Vui lòng nhập đầy đủ thông tin!", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
      this.setState({
        phone: ""
      });
      return;
    }
    if (phone_regex.test(phone) === false) {
      toast.error("Số điện thoại không hợp lệ !", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
      this.setState({
        phone: ""
      });
      return;
    }
    const self = this;
    self.$f7.preloader.show();

    UserService.register(fullname, password, phone, stockId)
      .then((repsonse) => {
        self.$f7.preloader.hide();
        if (repsonse.data.error) {
          toast.error(repsonse.data.error, {
            position: toast.POSITION.TOP_LEFT,
            autoClose: 3000,
          });
        } else {
          toast.success("Đăng ký thành công.", {
            position: toast.POSITION.TOP_LEFT,
            autoClose: 1000,
            onClose: () => {
              self.$f7router.navigate("/login/");
            },
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

  phoneChange = (e) => {
    const val = e.target.value;
    if (e.target.validity.valid) this.setState({ phone: e.target.value });
    else if (val === '' || val === '-') this.setState({ phone: val });
  }

  render() {
    const { isLoading, isOpenStock, password, isReload } = this.state;
    return (
      <Page noNavbar noToolbar name="login">
        <div className="page-wrapper page-login">
          <div className="page-login__back">
            <Link onClick={() => this.$f7router.back()}>
              <i className="las la-arrow-left"></i>
            </Link>
          </div>
          <div className="page-login__content">
            <div className="page-login__logo">
              <div className="logo">
                <img
                  className="logo-reg"
                  src={SERVER_APP + "/app/images/logo-app.png"}
                />
              </div>
              <div className="title">Xin chào, Bắt đầu tạo tài khoản nào</div>
            </div>
            <div className="page-login__form">
              <form>
                <div className="title">Tạo tài khoản mới</div>
                <div className="page-login__form-item">
                  <input
                    type="text"
                    name="fullname"
                    autoComplete="off"
                    onChange={this.handleChangeInput}
                    placeholder="Họ và tên"
                  />
                </div>
                <div className="page-login__form-item">
                  <input
                    type="tel"
                    value={this.state.phone}
                    onChange={this.phoneChange}
                    pattern="^-?[0-9]\d*\.?\d*$"
                    placeholder="Số điện thoại"
                  />
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
                </div>
                <div className="page-login__form-item">
                  <button
                    type="button"
                    onClick={() => this.registrationSubmit()}
                    className={
                      "btn-login btn-me" +
                      (isLoading === true ? " loading" : "")
                    }
                  >
                    <span>Đăng ký</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="page-login__alert">
            Bạn đã có tài khoản ? <Link href="/login/">Đăng nhập</Link>
          </div>
        </div>
        <SelectStock
          isOpenStock={isOpenStock}
          //nameStock={(name) => this.nameStock(name)}
          isReload={isReload}
        />
      </Page>
    );
  }
}
