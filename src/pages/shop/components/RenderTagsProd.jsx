import React from "react";

function RenderTagsProd({ status }) {
  if (!status || !window.GlobalConfig?.APP?.Prod?.ShowTags) return "";
  return (
    <>
      {status.includes("1") && <div className="ribbon-new">Mới</div>}
      {status.includes("2") && <div className="ribbon-hot">Yêu thích +</div>}
      {status.includes("3") && <div className="ribbon-sale">Sale</div>}
    </>
  );
}

export default RenderTagsProd;
