import React from "react";
import { Link, Navbar, Page, Sheet, Toolbar } from "framework7-react";
import ReportKGForm from "./ReportKGForm";
import ReportKGList from "./ReportKGList";
import DatePicker from "react-mobile-datepicker";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      opened: false,
      initial: null,
      isOpen: false,
      selected: new Date(),
    };
  }

  componentDidMount() {}

  render() {
    const { opened, initial, isOpen, selected } = this.state;

    const dateConfig = {
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

    return (
      <Page ptr className="bg-white">
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-arrow-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Báo Kilogram</span>
            </div>
            <div
              className="page-navbar__back"
              onClick={() =>
                this.setState({
                  isOpen: true,
                })
              }
            >
              <Link>
                <i className="las la-calendar"></i>
              </Link>
            </div>
          </div>
        </Navbar>
        <ReportKGList
          selected={selected}
          onEdit={(val) => this.setState({ opened: true, initial: val })}
          f7={this.$f7}
        />
        <DatePicker
          theme="ios"
          cancelText="Đóng"
          confirmText="Lọc ngay"
          headerFormat="MM/YYYY"
          showCaption={true}
          dateConfig={dateConfig}
          value={selected}
          isOpen={isOpen}
          onSelect={(date) => {
            this.setState({
              selected: date,
              isOpen: false,
            });
          }}
          onCancel={() =>
            this.setState({
              isOpen: false,
            })
          }
        />
        <Sheet
          className="demo-sheet-swipe-to-close"
          style={{
            height: "auto",
            "--f7-sheet-bg-color": "#fff",
            borderRadius: "10px 10px 0 0",
          }}
          swipeToClose
          backdrop
          opened={opened}
          onSheetClosed={() =>
            this.setState({
              opened: false,
              initial: null,
            })
          }
        >
          <ReportKGForm
            onClose={() =>
              this.setState({
                opened: false,
                initial: null,
              })
            }
            initial={initial}
          />
        </Sheet>
        <Toolbar tabbar position="bottom">
          <button
            className="page-btn-order btn-submit-order"
            onClick={() =>
              this.setState({
                opened: true,
              })
            }
          >
            Báo KG hôm nay
          </button>
        </Toolbar>
      </Page>
    );
  }
}
