import React from "react";
import { SERVER_APP } from "../../../constants/config";
import { TruncateLines } from "react-truncate-lines";

import moment from "moment";
import "moment/locale/vi";
import { useState } from "react";
import { useEffect } from "react";
import { PhotoBrowser } from "framework7-react";
import { useRef } from "react";

moment.locale("vi");

function EmployeeImage({ img }) {
  const [photos, setPhotos] = useState([]);
  const standaloneDark = useRef();

  useEffect(() => {
    if (img) {
      setPhotos([
        {
          url: SERVER_APP + "/Upload/image/" + img?.Src,
          caption: img.Iitle,
        },
      ]);
    }
  }, [img]);

  return (
    <div
      className="img-item-lst_o"
      onClick={() => {
        standaloneDark.current.open()
      }}
    >
      <img src={SERVER_APP + '/Upload/image/' + img?.Src} alt={img?.Iitle} />
      <div className="time">
        <TruncateLines lines={2} ellipsis={<span>...</span>}>
          {moment(img?.BookDate).format("HH:mm")} - {img?.Title}
        </TruncateLines>
      </div>
      <PhotoBrowser
        photos={photos}
        theme="dark"
        type="popup"
        popupCloseLinkText="Đóng"
        navbarOfText="/"
        ref={standaloneDark}
      />
    </div>
  );
}

export default EmployeeImage;
