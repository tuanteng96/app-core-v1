import { Link } from 'framework7-react'
import React, { Fragment } from 'react'
import NewsDataService from '../../../../service/news.service'
import Slider from 'react-slick'
import { SERVER_APP } from '../../../../constants/config'

export default class ServiceHot2 extends React.Component {
  constructor() {
    super()
    this.state = {
      width: window.innerWidth,
      isLoading: true,
      arrService: [],
    }
  }
  componentDidMount() {
    this.getServiceHot()
  }
  handStyle = () => {
    const _width = this.state.width - 90
    return Object.assign({
      width: _width,
    })
  }

  getServiceHot = () => {
    NewsDataService.getBannerName(this.props.id)
      .then((response) => {
        const arrService = response.data.data
        this.setState({
          arrService: arrService,
          isLoading: false,
        })
      })
      .catch((e) => {
        console.log(e)
      })
  }
  handleUrl = (item) => {
    if(item.Link && item.Link.includes('/schedule/')) {
        const url = `${item.Link}&note=${encodeURIComponent(item.Title)}`
        this.props.f7.navigate(url)
    }
    else {
        this.props.f7.navigate(item.Link)
    }
  }
  render() {
    const { arrService, isLoading } = this.state
    const settingsNews = {
      className: 'slider variable-width',
      dots: false,
      arrows: false,
      infinite: true,
      slidesToShow: 1,
      centerPadding: '20px',
      variableWidth: true,
      autoplay: true,
      autoplaySpeed: 7000,
      centerMode: true,

    }
    return (
      <Fragment>
        {arrService && arrService.length > 0 && (
          <div className="home-page__news mb-0 pt-8px bg-transparent">
            <div className="page-news__list">
              <div className="page-news__list-ul">
                <Slider {...settingsNews}>
                  {arrService &&
                    arrService.slice(0, 6).map((item, index) => (
                      <Link
                        className="service-hot2"
                        key={index}
                        style={this.handStyle()}
                        onClick={() => this.handleUrl(item)}
                      >
                        <div
                          className="bg"
                          style={{ background: item.FileName2 }}
                        >
                          <div
                            className="image"
                            style={{
                              backgroundImage: `url("${SERVER_APP}/Upload/image/${item.FileName}")`,
                            }}
                          />
                          <div className="text">
                            <div>
                              <h4>{item.Title}</h4>
                              <div
                                className="text-desc"
                                dangerouslySetInnerHTML={{ __html: item.Desc }}
                              ></div>
                            </div>
                            <div className="btns">
                              <div className="btn-more">Xem thêm</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </Slider>
              </div>
            </div>
          </div>
        )}
      </Fragment>
    )
  }
}
