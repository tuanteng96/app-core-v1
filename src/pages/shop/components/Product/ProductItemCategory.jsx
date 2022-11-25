import { Link } from "framework7-react";
import React from "react";
import { SERVER_APP } from "../../../../constants/config";
import ReactHtmlParser from "react-html-parser";

export default class ProductItemCategory extends React.Component {
  constructor() {
    super();
    this.state = {

    };
  }
  render() {
    const { item, isUI } = this.props;
    return (
      <li className={`${isUI > 0 ? "no-before" : ""}`} key={item.ID}>
        <Link href={item.Link}>
          <div className="image">
            <img
              className={`${isUI > 0 ? "h-auto" : ""}`}
              src={SERVER_APP + "/Upload/image/" + item.FileName}
              alt={item.Title}
            />
          </div>
          {
            isUI === 0 && <div className="text">
              <h3>{item.Title}</h3>
              <div className="text-desc">{ReactHtmlParser(item.Desc)}</div>
            </div>
          }
        </Link>
      </li>
    );
  }
}