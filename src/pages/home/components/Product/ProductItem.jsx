import React from 'react'
import { SERVER_APP } from '../../../../constants/config'
import { checkSale, formatPriceVietnamese } from '../../../../constants/format'
import { Link } from 'framework7-react'
import RenderTagsProd from '../../../shop/components/RenderTagsProd'
import { TruncateLines } from 'react-truncate-lines'

export default class ProductItem extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    const { item, source } = this.props
    return (
      <Link href={'/shop/detail/' + item.id} className="page-shop__list-item">
        <div className="page-shop__list-img">
          <RenderTagsProd status={item?.source?.Status} />
          <img
            src={SERVER_APP + '/Upload/image/' + item.photo}
            alt={item.title}
          />
        </div>
        <div className="page-shop__list-text">
          <h3 className="w-100">
            <TruncateLines lines={2} ellipsis={<span>...</span>}>
              {item.title}
            </TruncateLines>
          </h3>
          <div
            className={
              'page-shop__list-price ' +
              (checkSale(source.SaleBegin, source.SaleEnd, item.pricesale) ===
              true
                ? 'sale'
                : '')
            }
          >
            <span className="price">
              <b>₫</b>
              {formatPriceVietnamese(item.price)}
            </span>
            <span className="price-sale">
              <b>₫</b>
              {formatPriceVietnamese(item.pricesale)}
            </span>
          </div>
        </div>
      </Link>
    )
  }
}
