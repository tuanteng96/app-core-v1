import { Link } from "framework7-react";
import React from "react";
import { FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
import { CALL_PHONE, OPEN_LINK } from "../../constants/prom21";
import userService from "../../service/user.service";
import { iOS } from "./../../constants/helpers";

export default class quickAction extends React.Component {
  constructor() {
    super();
    this.state = {
      isOpen: false,
    };
  }
  componentDidMount() {
    this.getPhone();
  }
  getPhone = () => {
    userService
      .getConfig("Chung.sdt,chung.link.fanpage")
      .then((response) => {
        this.setState({
          phone: response.data.data[1].ValueText,
          mess: `https://m.me/${response.data.data[0].ValueText}`,
        });
      })
      .catch((err) => console.log(err));
  };

  handleCall = (phone) => {
    CALL_PHONE(phone);
  };
  handleLink = (link) => {
    OPEN_LINK(link)
  }
  onOpen = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };
  
  render() {
    const { mess, phone, isOpen } = this.state;
    if (!mess || !phone) return "";
    return (
      <div className={`page-quick ${isOpen ? "open" : ""}`}>
        <div className="page-quick-list">
          {phone && (
            <div
              className="item call"
              onClick={() => this.handleCall(phone && phone)}
            >
              <FaWhatsapp />
            </div>
          )}
          {mess && (
            <>
              {iOS() ? (
                <Link external href={mess} noLinkClass className="item mess">
                  <FaFacebookMessenger />
                </Link>
              ) : (
                <div
                  className="item mess"
                  onClick={() => this.handleLink(mess)}
                >
                  <FaFacebookMessenger />
                </div>
              )}
            </>
          )}
        </div>
        <div className="btn-quick" onClick={this.onOpen}>
          <div className="btn-quick-trans">
            <FaWhatsapp />
            <i className="las la-times times"></i>
          </div>
        </div>
      </div>
    );
  }
}
