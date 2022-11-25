import {
  Navbar,
  Toolbar,
  Page,
  Link,
  Button,
  Sheet,
  PageContent,
} from 'framework7-react'
import React from 'react'
import IconSucces from '../../assets/images/box.svg'
import NotificationIcon from '../../components/NotificationIcon'
import ToolBarBottom from '../../components/ToolBarBottom'
import userService from '../../service/user.service'
import Skeleton from 'react-loading-skeleton'
import ReactHtmlParser from 'react-html-parser'
import { formatPriceVietnamese } from '../../constants/format'

export default class extends React.Component {
  constructor() {
    super()
    this.state = {
      loadingText: false,
      textPay: '',
    }
  }
  componentDidMount() {
    // const userInfo = getUser();
    // if (!userInfo) return false;
    // const pwd = getPassword();
    // UserService.getInfo(userInfo.MobilePhone, pwd)
    //   .then((response) => {
    //     const data = response.data.info;
    //     setUserStorage(data.etoken, data, pwd);
    //   })
    //   .catch((er) => console.log(er));

    this.setState({
      loadingText: true,
    })
    userService
      .getConfig('App.thanhtoan')
      .then(({ data }) => {
        this.setState({
          textPay: data.data && data.data[0]?.ValueLines,
          loadingText: false,
        })
      })
      .catch((error) => console.log(error))
  }
  render() {
    const { loadingText, textPay } = this.state
    return (
      <Page
        onPageBeforeOut={this.onPageBeforeOut}
        onPageBeforeRemove={this.onPageBeforeRemove}
        name="shop-pay-success"
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link href="/news/">
                <i className="las la-home"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Thành công</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="page-pay-success bg-white min-h-100 p-20px bz-bb">
          <div className="image mb-20px">
            <img className="w-125px" src={IconSucces} alt="Đơn hàng được gửi thành công!" />
          </div>
          {/* <div className="text">
            Đơn hàng <span>#{this.$f7route.params.orderID}</span> của bạn đã
            được gửi thành công.
          </div> */}
          <div className="text-center mb-20px">
            {
              loadingText && <Skeleton count={5} />
            }
            {!loadingText &&
              textPay &&
              ReactHtmlParser(
                textPay
                  .replaceAll('ID_ĐH', `<b class="fw-600 text-danger">#${this.$f7route.params.orderID}</b>`)
                  .replaceAll(
                    'MONEY',
                    `<b class="fw-600 text-danger">${formatPriceVietnamese(
                      Math.abs(this.$f7route.query.money),
                    )} ₫</b>`,
                  )
                  .replaceAll('ID_DH', `<b class="fw-600 text-danger">#${this.$f7route.params.orderID}</b>`),
              )}
          </div>
          <div className="btn">
            <Link href="/order/">Đơn hàng của bạn</Link>
            <Link className="mb-0"href="/shop/">Tiếp tục mua hàng</Link>
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    )
  }
}
