import React from "react";
import {
  Button,
  f7,
  Link,
  Navbar,
  Page,
  PageContent,
  Sheet,
  Toolbar,
} from "framework7-react";
import NotificationIcon from "../../../components/NotificationIcon";
import ToolBarBottom from "../../../components/ToolBarBottom";
import { getUser } from "../../../constants/user";
import { formatPriceVietnamese } from "../../../constants/format";
import staffService from "../../../service/staff.service";
import DatePicker from "react-mobile-datepicker";
import moment from "moment";
import "moment/locale/vi";
import SkeletonStatistical from "./skeleton/SkeletonStatistical";
moment.locale("vi");

export default class employeeStatistical extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      isOpenDate: false,
      isDateCurrent: moment().format("DD/MM/YYYY"),
      monthCurrent: moment().format("MM/YYYY"),
      sheetOpened: {
        sheet1: false,
        sheet2: false,
      },
    };
  }

  componentDidMount() {
    const month = moment().format("MM/YYYY");
    this.getSalary(month);
  }

  dateObject = (date) => {
    const dateMomentObject = moment(date, "DD/MM/YYYY"); // 1st argument - string, 2nd argument - format
    return dateMomentObject.toDate();
  };

  numTotal = (arr) => {
    const initialValue = 0;
    if (!arr) return initialValue;
    let sum = arr.reduce(function (total, currentValue) {
      return total + currentValue.Value;
    }, initialValue);

    return sum;
  };

  numTotalQty = (arr) => {
    const initialValue = 0;
    if (!arr) return initialValue;
    let sum = arr.reduce(function (total, currentValue) {
      return total + currentValue.qty;
    }, initialValue);

    return sum;
  };

  SalaryServices = (dataSalary) => {
    const SalaryServices = dataSalary.filter((z) => {
      return !z.IsPending;
    });
    return this.numTotal(SalaryServices);
  };

  basicSalary = (dataSalary) => {
    let value = 0; //luong du kien
    value += dataSalary.CHAM_CONG_TINH_LUONG
      ? dataSalary.LUONG_CHAM_CONG || 0
      : dataSalary.LUONG_CO_BAN || 0;

    value += this.SalaryServices(dataSalary.SalaryServices);
    value += this.numTotal(dataSalary.BonusSales);
    value += this.numTotal(dataSalary.Bonus);
    value -= this.numTotal(dataSalary.NGAY_NGHI);
    value -= this.numTotal(dataSalary.PHAT);
    value += dataSalary.PHU_CAP;
    value += dataSalary?.THUONG_HOA_HONG_DOANH_SO?.Value || 0;
    return value;
  };

  totalDayOff = (arr) => {
    if (arr.length > 0) {
      const initialValue = 0;
      let sum = arr.reduce(function (total, currentValue) {
        return total + currentValue.qty;
      }, initialValue);

      return sum;
    }
    return 0;
  };

  getSalary = (date) => {
    if (!getUser()) return false;
    const infoMember = getUser();
    const userID = infoMember.ID;
    staffService
      .getSalary(userID, date)
      .then((response) => {
        const result = response.data.data;
        setTimeout(() => {
          this.setState({
            dataSalary: result,
            isLoading: false,
          });
        }, 500);
      })
      .catch((error) => console.log(error));
  };

  handleDate = () => {
    this.setState({
      isOpenDate: true,
    });
  };

  handleSelectDate = async (date) => {
    const dateFull = moment(date).format("DD/MM/YYYY");
    const month = moment(date).format("MM/YYYY");
    f7.dialog.preloader(`??ang t???i th???ng k?? th??ng ${month}`);
    this.setState({
      isOpenDate: false,
      isLoading: true,
      isDateCurrent: dateFull,
      monthCurrent: month,
    });
    const getSalary = await this.getSalary(month);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    f7.dialog.close();
    this.setState({
      isLoading: false,
    });
  };

  handleCancelDate = () => {
    this.setState({ isOpenDate: false });
  };

  getValueConfig = (dataConfig, nameConfig) => {
    if (!dataConfig) return 0;
    const index = dataConfig.findIndex((item) => item.Name === nameConfig);
    if (index > -1) {
      return dataConfig[index].Value;
    }
    return 0;
  };

  OpenSheet = (sheet) => {
    const { dataSalary } = this.state;
    if (sheet === "sheet1") {
      if (
        dataSalary &&
        dataSalary.NGAY_NGHI &&
        dataSalary.NGAY_NGHI.length > 0
      ) {
        this.setState({
          sheetOpened: {
            sheet1: true,
            sheet2: false,
            sheet3: false,
          },
        });
      }
    }
    if (sheet === "sheet2") {
      this.setState({
        sheetOpened: {
          sheet1: false,
          sheet2: true,
          sheet3: false,
        },
      });
    }

    if (sheet === "sheet3") {
      this.setState({
        sheetOpened: {
          sheet1: false,
          sheet2: false,
          sheet3: true,
        },
      });
    }
  };

  HideSheet = () => {
    this.setState({
      sheetOpened: {
        sheet1: false,
        sheet2: false,
      },
    });
  };

  totalValue = (items, prop) => {
    if (!items) return 0;
    return items.reduce(function (a, b) {
      return a + b[prop];
    }, 0);
  };

  async loadRefresh(done) {
    const { monthCurrent } = this.state;
    await this.getSalary(monthCurrent);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    done();
  }

  render() {
    const {
      dataSalary,
      isLoading,
      isOpenDate,
      isDateCurrent,
      monthCurrent,
      sheetOpened,
    } = this.state;
    const dateConfig = {
      month: {
        caption: "Th??ng",
        format: "M",
        step: 1,
      },
      year: {
        caption: "N??m",
        format: "YYYY",
        step: 1,
      },
    };

    return (
      <Page
        name="employee-statistical"
        onPtrRefresh={this.loadRefresh.bind(this)}
        ptr
        infiniteDistance={50}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.handleDate()}>
                <i className="las la-calendar"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">
                Th???ng k?? ({monthCurrent && monthCurrent})
              </span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        {isLoading && <SkeletonStatistical />}
        {!isLoading && (
          <div className="page-render p-0">
            <div className="employee-statistical">
              {!dataSalary?.TY_LE_GIU_LUONG ||
              (dataSalary?.CHI_GIU_LUONG &&
                dataSalary?.CHI_GIU_LUONG.length > 0 &&
                this.totalValue(dataSalary?.THU_GIU_LUONG, "Value") ===
                  this.totalValue(dataSalary?.CHI_GIU_LUONG, "Value")) ? (
                <React.Fragment></React.Fragment>
              ) : (
                <div
                  className="employee-statistical__item mb-1px"
                  style={{
                    background: "#fbfbfb",
                  }}
                >
                  <div
                    className="d-flex justify-content-between p-12px"
                    onClick={() => this.OpenSheet("sheet3")}
                  >
                    <div className="text-danger fw-500 font-size-xs">
                      ???? gi??? l????ng {dataSalary?.THU_GIU_LUONG.length} th??ng
                    </div>
                    <div className="text-danger fw-600 font-size-xs">
                      <span>
                        {dataSalary &&
                          formatPriceVietnamese(
                            this.totalValue(dataSalary?.THU_GIU_LUONG, "Value")
                          )}
                      </span>
                      <i className="fas fa-exclamation-circle text-warning pl-5px"></i>
                    </div>
                  </div>
                </div>
              )}

              {dataSalary &&
              (dataSalary.CHI_LUONG.length ||
                dataSalary.CHI_LUONG_TAT_CA.length) > 0 ? (
                <div className="employee-statistical__item">
                  <div className="title">???? tr??? l????ng</div>
                  {dataSalary.CHI_LUONG_TAT_CA.map((o, idx) => (
                    <div className="tfooter" key={idx}>
                      <div className="tr">
                        <div className="td">???? tr??? l???n {idx + 1}</div>
                        <div className="td">
                          {dataSalary && formatPriceVietnamese(o.Value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="employee-statistical__item">
                  <div className="title">Ch??a tr??? l????ng</div>
                  <div className="tfooter">
                    <div className="tr">
                      <div className="td">D??? ki???n</div>
                      <div className="td">
                        {dataSalary &&
                          formatPriceVietnamese(this.basicSalary(dataSalary))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="employee-statistical__item">
                <div className="title" onClick={() => this.OpenSheet("sheet2")}>
                  L????ng theo ch???m c??ng{" "}
                  <i className="fas fa-exclamation-circle text-warning pl-2px"></i>
                </div>
                <div className="head">
                  <div className="tr">
                    <div className="td w-1">STT</div>
                    <div className="td w-2">H???ng m???c</div>
                    <div className="td w-3">Gi?? tr???</div>
                  </div>
                </div>
                <div className="tbody">
                  <div className="tr">
                    <div className="td w-1">1</div>
                    <div className="td w-2">L????ng c?? b???n</div>
                    <div className="td w-3">
                      {dataSalary &&
                        formatPriceVietnamese(dataSalary.LUONG_CO_BAN)}
                    </div>
                  </div>
                  <div className="tr">
                    <div className="td w-1">2</div>
                    <div
                      className="td w-2"
                      onClick={() => this.OpenSheet("sheet1")}
                    >
                      Tr??? l????ng ngh???{" "}
                      {dataSalary &&
                        dataSalary.NGAY_NGHI &&
                        dataSalary.NGAY_NGHI.length > 0 && (
                          <i className="fas fa-exclamation-circle text-warning pl-2px"></i>
                        )}
                    </div>
                    <div className="td w-3">
                      {dataSalary &&
                        formatPriceVietnamese(
                          this.numTotal(dataSalary?.NGAY_NGHI)
                        )}
                    </div>
                  </div>
                  <div className="tr">
                    <div className="td w-1">3</div>
                    <div className="td w-2">Ph??? c???p</div>
                    <div className="td w-3">
                      {dataSalary && formatPriceVietnamese(dataSalary.PHU_CAP)}
                    </div>
                  </div>
                </div>
                <div className="tfooter">
                  <div className="tr">
                    <div className="td">T???ng</div>
                    <div className="td">
                      {dataSalary &&
                        formatPriceVietnamese(
                          dataSalary.LUONG_CO_BAN -
                            this.numTotal(dataSalary?.NGAY_NGHI) +
                            dataSalary.PHU_CAP
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <Sheet
                opened={sheetOpened.sheet3}
                className={`sheet-detail sheet-detail-wallet sheet-detail-order`}
                style={{
                  height: "auto !important",
                  "--f7-sheet-bg-color": "#fff",
                }}
                onSheetClosed={() => {
                  this.HideSheet();
                }}
                swipeToClose
                backdrop
              >
                <Button
                  className="show-close sheet-close"
                  onClick={() => this.HideSheet()}
                >
                  <i className="las la-times"></i>
                </Button>
                <PageContent>
                  <div className="employee-statistical__item mb-0">
                    <div className="title">Chi ti???t gi??? l????ng</div>
                    <div className="head">
                      <div className="tr">
                        <div className="td w-1">STT</div>
                        <div className="td w-2">H???ng m???c</div>
                        <div className="td w-3">Gi?? tr???</div>
                      </div>
                    </div>
                    <div className="tbody">
                      {dataSalary.THU_GIU_LUONG &&
                        dataSalary.THU_GIU_LUONG.map((item, idx) => (
                          <div className="tr" key={idx}>
                            <div className="td w-1">{idx + 1}</div>
                            <div className="td w-2">
                              {item.Desc} - Th??ng {item.Rel}
                            </div>
                            <div className="td w-3">
                              {formatPriceVietnamese(item.Value)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </PageContent>
              </Sheet>

              <Sheet
                opened={sheetOpened.sheet2}
                className={`sheet-detail sheet-detail-wallet sheet-detail-order`}
                style={{
                  height: "auto !important",
                  "--f7-sheet-bg-color": "#fff",
                }}
                onSheetClosed={() => {
                  this.HideSheet();
                }}
                swipeToClose
                backdrop
              >
                <Button
                  className="show-close sheet-close"
                  onClick={() => this.HideSheet()}
                >
                  <i className="las la-times"></i>
                </Button>
                <PageContent>
                  <div className="employee-statistical__item mb-0">
                    <div className="title">L????ng ch??nh s??ch</div>
                    <div className="head">
                      <div className="tr">
                        <div className="td w-1">STT</div>
                        <div className="td w-2">H???ng m???c</div>
                        <div className="td w-3">Gi?? tr???</div>
                      </div>
                    </div>
                    <div className="tbody">
                      <div className="tr">
                        <div className="td w-1">1</div>
                        <div className="td w-2">L????ng c?? b???n</div>
                        <div className="td w-3">
                          {dataSalary &&
                            formatPriceVietnamese(
                              dataSalary.LUONG_CO_BAN_THANG
                            )}
                        </div>
                      </div>
                      <div className="tr">
                        <div className="td w-1">2</div>
                        <div className="td w-2">Ng??y c??ng y??u c???u</div>
                        <div className="td w-3">
                          {dataSalary && dataSalary.NGAY_CONG}
                        </div>
                      </div>
                      <div className="tr">
                        <div className="td w-1">3</div>
                        <div className="td w-2">Ng??y ngh??? cho ph??p</div>
                        <div className="td w-3">
                          {dataSalary
                            ? this.getValueConfig(
                                dataSalary.UserSalaryConfig,
                                "NGAY_PHEP"
                              )
                            : 0}
                        </div>
                      </div>
                      <div className="tr">
                        <div className="td w-1">4</div>
                        <div className="td w-2">Ph??? c???p</div>
                        <div className="td w-3">
                          {dataSalary &&
                            formatPriceVietnamese(dataSalary.PHU_CAP)}
                        </div>
                      </div>
                    </div>
                  </div>
                </PageContent>
              </Sheet>

              <Sheet
                opened={sheetOpened.sheet1}
                className={`sheet-detail sheet-detail-wallet sheet-detail-order`}
                style={{
                  height: "auto !important",
                  "--f7-sheet-bg-color": "#fff",
                }}
                onSheetClosed={() => {
                  this.HideSheet();
                }}
                swipeToClose
                backdrop
              >
                <Button
                  className="show-close sheet-close"
                  onClick={() => this.HideSheet()}
                >
                  <i className="las la-times"></i>
                </Button>
                <PageContent>
                  {dataSalary && dataSalary.DS_NGAY_NGHI.length > 0 && (
                    <div className="employee-statistical__item mb-0">
                      <div className="title">Ng??y ngh???</div>
                      <div className="head">
                        <div className="tr">
                          <div className="td w-1">STT</div>
                          <div className="td w-2">S??? bu???i</div>
                          <div className="td w-3">Ti???n tr???</div>
                        </div>
                      </div>
                      <div className="tbody">
                        {dataSalary.NGAY_NGHI.map((item, index) => (
                          <div className="tr" key={index}>
                            <div className="td w-1">{index + 1}</div>
                            <div className="td w-2">
                              {item.Meta && JSON.parse(item.Meta)?.day} ng??y
                            </div>
                            <div className="td w-3">
                              <div className="text-danger fw-500">
                                -{formatPriceVietnamese(item.Value)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </PageContent>
              </Sheet>

              <div className="employee-statistical__item">
                <div className="title">
                  C???ng ti???n (
                  <span>{dataSalary && dataSalary.Bonus.length}</span>)
                </div>
                <div className="head">
                  <div className="tr">
                    <div className="td w-1">STT</div>
                    <div className="td w-2">H???ng m???c</div>
                    <div className="td w-3">Gi?? tr???</div>
                  </div>
                </div>
                <div className="tbody">
                  {dataSalary &&
                    dataSalary.Bonus.map((item, index) => (
                      <div className="tr" key={index}>
                        <div className="td w-1">{index + 1}</div>
                        <div className="td w-2">
                          {item.Desc || "Th?????ng"} - ({" "}
                          {moment(item.CreateDate).format("llll")} )
                        </div>
                        <div className="td w-3">
                          {formatPriceVietnamese(item.Value)}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="tfooter">
                  <div className="tr">
                    <div className="td">T???ng</div>
                    <div className="td">
                      {dataSalary &&
                        formatPriceVietnamese(this.numTotal(dataSalary.Bonus))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="employee-statistical__item">
                <div className="title">Tr??? ti???n</div>
                <div className="head">
                  <div className="tr">
                    <div className="td w-1">STT</div>
                    <div className="td w-2">H???ng m???c</div>
                    <div className="td w-3">Gi?? tr???</div>
                  </div>
                </div>
                <div className="tbody">
                  {dataSalary &&
                    dataSalary.PHAT.map((item, index) => (
                      <div className="tr" key={index}>
                        <div className="td w-1">{index + 1}</div>
                        <div className="td w-2">
                          {item.Desc || "Ph???t"} - Ng??y{" "}
                          {moment(item.CreateDate).format("llll")}
                        </div>
                        <div className="td w-3">
                          {formatPriceVietnamese(item.Value)}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="tfooter">
                  <div className="tr">
                    <div className="td">T???ng ph???t</div>
                    <div className="td">
                      {dataSalary &&
                        formatPriceVietnamese(this.numTotal(dataSalary.PHAT))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="employee-statistical__item">
                <div className="title">
                  L????ng d???ch v??? (
                  <span>{dataSalary && dataSalary.SalaryServices.length}</span>)
                </div>
                <div className="head">
                  <div className="tr">
                    <div className="td w-1">STT</div>
                    <div className="td w-2">H???ng m???c</div>
                    <div className="td w-3">Gi?? tr???</div>
                  </div>
                </div>
                <div className="tbody">
                  {dataSalary &&
                    dataSalary.SalaryServices.map((item, index) => {
                      if (!item.IsPending)
                        return (
                          <div className="tr" key={index}>
                            <div className="td w-1">{index + 1}</div>
                            <div className="td w-2">
                              <span
                                className={`label-inline ${
                                  item.OSStatus === "done"
                                    ? "label-light-success"
                                    : "label-light-warning"
                                }`}
                              >
                                {item.OSStatus === "done"
                                  ? "Ho??n th??nh"
                                  : "??ang th???c hi???n"}
                              </span>
                              {item.ProdTitle} - ({" "}
                              {moment(item.CreateDate).format("llll")} )
                              <div>
                                {item?.Member?.FullName}
                                {!window?.GlobalConfig?.APP?.Staff
                                  ?.hidePhoneMember &&
                                  ` - ${item?.Member?.MobilePhone}`}
                              </div>
                            </div>
                            <div className="td w-3">
                              {formatPriceVietnamese(item.Value)}
                            </div>
                          </div>
                        );
                    })}
                </div>
                <div className="tfooter">
                  <div className="tr">
                    <div className="td">T???ng </div>
                    <div className="td">
                      {dataSalary &&
                        formatPriceVietnamese(
                          this.SalaryServices(dataSalary.SalaryServices)
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="employee-statistical__item">
                <div className="title">
                  Hoa h???ng b??n h??ng (
                  <span>
                    {(dataSalary && dataSalary.BonusSales?.length) || 0}
                  </span>
                  )
                </div>
                <div className="head">
                  <div className="tr">
                    <div className="td w-1">STT</div>
                    <div className="td w-2">H???ng m???c</div>
                    <div className="td w-3">Gi?? tr???</div>
                  </div>
                </div>
                <div className="tbody">
                  {dataSalary &&
                    dataSalary.BonusSales?.map((item, index) => (
                      <div className="tr" key={index}>
                        <div className="td w-1">{index + 1}</div>
                        <div className="td w-2">
                          Hoa h???ng - ( {moment(item.CreateDate).format("llll")}{" "}
                          )<div>{item.ProdTitle}</div>
                        </div>
                        <div className="td w-3">
                          {formatPriceVietnamese(item.Value)}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="tfooter">
                  <div className="tr">
                    <div className="td">T???ng</div>
                    <div className="td">
                      {dataSalary &&
                        formatPriceVietnamese(
                          this.numTotal(dataSalary.BonusSales)
                        )}
                    </div>
                  </div>
                </div>
              </div>
              {((dataSalary && dataSalary.DOANH_SO.length > 0) ||
                (dataSalary?.CHI_LUONG &&
                  dataSalary.CHI_LUONG.length === 0)) && (
                <div className="employee-statistical__item">
                  <div className="title">
                    Doanh s??? b??n h??ng (
                    <span>{dataSalary && dataSalary.DOANH_SO.length}</span>)
                  </div>
                  <div className="head">
                    <div className="tr">
                      <div className="td w-1">STT</div>
                      <div className="td w-2">H???ng m???c</div>
                      <div className="td w-3">Gi?? tr???</div>
                    </div>
                  </div>
                  <div className="tbody">
                    {dataSalary.DOANH_SO.map((item, index) => (
                      <div className="tr" key={index}>
                        <div className="td w-1">{index + 1}</div>
                        <div className="td w-2">
                          {item.Desc || "Doanh s???"} - ({" "}
                          {moment(item.CreateDate).format("llll")} )
                          <div>{item.ProdTitle}</div>
                        </div>
                        <div className="td w-3">
                          {formatPriceVietnamese(item.Value)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="tfooter">
                    <div className="tr">
                      <div className="td">T???ng</div>
                      <div className="td">
                        {formatPriceVietnamese(
                          this.numTotal(dataSalary.DOANH_SO)
                        )}
                      </div>
                    </div>
                    {dataSalary.THUONG_HOA_HONG_DOANH_SO &&
                      dataSalary.THUONG_HOA_HONG_DOANH_SO.ApplyList &&
                      dataSalary.THUONG_HOA_HONG_DOANH_SO.ApplyList.map(
                        (appy, idx) => (
                          <div className="tr" key={idx}>
                            <div className="td">
                              {appy.Type === 0
                                ? "KPI Chung"
                                : `KPI nh??m ${appy.Type}`}
                            </div>
                            <div className="td">
                              {formatPriceVietnamese(appy.Value)}
                            </div>
                          </div>
                        )
                      )}

                    {dataSalary.CHI_LUONG &&
                      dataSalary.CHI_LUONG.length === 0 && (
                        <div className="tr">
                          <div className="td">D??? ki???n th?????ng KPI</div>
                          <div className="td">
                            {dataSalary?.THUONG_HOA_HONG_DOANH_SO?.Bonus >
                              0 && (
                              <span style={{ paddingRight: "8px" }}>
                                ({dataSalary?.THUONG_HOA_HONG_DOANH_SO?.Bonus}%)
                              </span>
                            )}
                            {dataSalary &&
                              formatPriceVietnamese(
                                dataSalary?.THUONG_HOA_HONG_DOANH_SO?.Value || 0
                              )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
              <div className="employee-statistical__item">
                <div className="title">
                  T???m ???ng (
                  <span>{dataSalary && dataSalary.TAM_UNG.length}</span>)
                </div>
                <div className="head">
                  <div className="tr">
                    <div className="td w-1">STT</div>
                    <div className="td w-2">H???ng m???c</div>
                    <div className="td w-3">Gi?? tr???</div>
                  </div>
                </div>
                <div className="tbody">
                  {dataSalary &&
                    dataSalary.TAM_UNG.map((item, index) => (
                      <div className="tr" key={index}>
                        <div className="td w-1">{index + 1}</div>
                        <div className="td w-2">
                          {item.Desc || "T???m ???ng"} - ({" "}
                          {moment(item.CreateDate).format("llll")} )
                        </div>
                        <div className="td w-3">
                          {formatPriceVietnamese(Math.abs(item.Value))}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="tfooter">
                  <div className="tr">
                    <div className="td">T???ng</div>
                    <div className="td">
                      {dataSalary &&
                        formatPriceVietnamese(
                          Math.abs(this.numTotal(dataSalary.TAM_UNG))
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="employee-statistical__item">
                <div className="title">
                  Ho??n ???ng (
                  <span>{dataSalary && dataSalary.THU_HOAN_UNG.length}</span>)
                </div>
                <div className="head">
                  <div className="tr">
                    <div className="td w-1">STT</div>
                    <div className="td w-2">H???ng m???c</div>
                    <div className="td w-3">Gi?? tr???</div>
                  </div>
                </div>
                <div className="tbody">
                  {dataSalary &&
                    dataSalary.THU_HOAN_UNG.map((item, index) => (
                      <div className="tr" key={index}>
                        <div className="td w-1">{index + 1}</div>
                        <div className="td w-2">
                          {item.Desc || "Ho??n ???ng"} - ({" "}
                          {moment(item.CreateDate).format("llll")} )
                        </div>
                        <div className="td w-3">
                          {formatPriceVietnamese(item.Value)}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="tfooter">
                  <div className="tr">
                    <div className="td">T???ng</div>
                    <div className="td">
                      {dataSalary &&
                        formatPriceVietnamese(
                          this.numTotal(dataSalary.THU_HOAN_UNG)
                        )}
                    </div>
                  </div>
                </div>
              </div>
              {dataSalary && dataSalary?.CHI_LUONG.length === 0 && (
                <div className="employee-statistical__item">
                  <div className="title">L????ng c???a b???n</div>
                  <div className="tfooter">
                    <div className="tr">
                      <div className="td">D??? ki???n</div>
                      <div className="td">
                        {dataSalary &&
                          formatPriceVietnamese(this.basicSalary(dataSalary))}
                      </div>
                    </div>
                    <div className="tr">
                      <div className="td">Gi??? l????ng</div>
                      <div className="td">
                        {dataSalary &&
                          formatPriceVietnamese(
                            dataSalary.TY_LE_GIU_LUONG > 100
                              ? dataSalary.TY_LE_GIU_LUONG
                              : Math.ceil(
                                  (this.basicSalary(dataSalary) / 100) *
                                    dataSalary.TY_LE_GIU_LUONG
                                )
                          )}
                      </div>
                    </div>
                    <div className="tr">
                      <div className="td">T???m ???ng c??n l???i</div>
                      <div className="td">
                        {dataSalary &&
                          formatPriceVietnamese(
                            Math.abs(this.numTotal(dataSalary.TAM_UNG)) -
                              Math.abs(this.numTotal(dataSalary.THU_HOAN_UNG))
                          )}
                      </div>
                    </div>
                    <div className="tr">
                      <div className="td">L????ng th???c nh???n</div>
                      <div className="td">
                        {dataSalary &&
                          formatPriceVietnamese(
                            this.basicSalary(dataSalary) -
                              (dataSalary.TY_LE_GIU_LUONG > 100
                                ? dataSalary.TY_LE_GIU_LUONG
                                : Math.ceil(
                                    (this.basicSalary(dataSalary) / 100) *
                                      dataSalary.TY_LE_GIU_LUONG
                                  )) -
                              (Math.abs(this.numTotal(dataSalary.TAM_UNG)) -
                                Math.abs(
                                  this.numTotal(dataSalary.THU_HOAN_UNG)
                                ))
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <DatePicker
          theme="ios"
          cancelText="????ng"
          confirmText="C???p nh???p"
          headerFormat="MM/YYYY"
          showCaption={true}
          dateConfig={dateConfig}
          value={isDateCurrent ? this.dateObject(isDateCurrent) : new Date()}
          isOpen={isOpenDate}
          onSelect={this.handleSelectDate}
          onCancel={this.handleCancelDate}
        />
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
