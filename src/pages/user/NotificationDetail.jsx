import React from "react";
import { Page, Navbar, Link, Toolbar } from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import userService from "../../service/user.service";
import ReactHtmlParser from "react-html-parser";
import Skeleton from "react-loading-skeleton";
import { SET_BADGE } from "../../constants/prom21";
import { iOS } from "../../constants/helpers";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
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
      this.setState({ data: data.data[0], isLoading: false });
      if (data.data[0] && !data.data[0].IsReaded) {
        iOS() && SET_BADGE();
        dataPost.append("ids", Id);
        await userService.readedNotification(dataPost);
      }
    } catch (error) {
      console.log(error);
    }
  };

  async loadRefresh(done) {
    done();
  }

  render() {
    const { isLoading, data } = this.state;

    return (
      <Page ptr onPtrRefresh={this.loadRefresh.bind(this)}>
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link
                onClick={() =>
                  this.$f7router.navigate(`/notification/`)
                }
              >
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
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
