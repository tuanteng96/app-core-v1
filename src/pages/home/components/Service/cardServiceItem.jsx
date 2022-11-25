import React from "react";
import { Link } from "framework7-react";
import { SERVER_APP } from "../../../../constants/config";
export default class CardServiceItem extends React.Component {
  constructor() {
    super();
    this.state = {
    };
  }
  render() {
    const item = this.props.item;
    return (
      <Link href={item.Link} noLinkClass>
        <img
          src={`${SERVER_APP}/Upload/image/${item.FileName}`}
          alt={item.Title}
        />
        <div className="text">{item.Title}</div>
      </Link>
    );
  }
}