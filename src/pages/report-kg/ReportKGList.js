import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getUser } from "../../constants/user";
import MemberAPI from "../../service/member.service";
import moment from "moment";
import { toast } from "react-toastify";

function ReportKGList({ onEdit, f7, selected }) {
  const queryClient = useQueryClient();

  const Member = getUser();
  const { data, isLoading } = useQuery({
    queryKey: ["MembersNoteKG", selected],
    queryFn: async () => {
      const startOfMonth = moment(selected)
        .startOf("month")
        .format("MM/DD/YYYY");
      const endOfMonth = moment(selected).endOf("month").format("MM/DD/YYYY");
      const { data } = await MemberAPI.listNoteKg({
        pi: 1,
        ps: 10,
        filter: {
          MemberID: 32877,
          CreateDate: [startOfMonth, endOfMonth],
        },
      });
      return data?.list || [];
    },
    onSuccess: (data) => {},
    enabled: Boolean(Member?.ID),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (body) => MemberAPI.deleteNoteKg(body),
  });

  const onDelete = (item) => {
    f7.dialog.confirm("Bạn có chắc chắn muốn xóa ?", () => {
      f7.dialog.preloader("Đang thực hiện ...");
      deleteNoteMutation.mutate(
        { delete: [item.ID] },
        {
          onSuccess: () => {
            queryClient
              .invalidateQueries({ queryKey: ["MembersNoteKG"] })
              .then(() => {
                f7.dialog.close();
                toast.success("Xóa thành công.");
              });
          },
        }
      );
    });
  };

  return (
    <div>
      {isLoading && <div className="p-15px">Đang tải ...</div>}
      {!isLoading && (
        <>
          {data &&
            data.length > 0 &&
            data.map((item, index) => (
              <div
                className="p-15px border-bottom d-flex justify-content-between align-items-center"
                key={index}
              >
                <div>
                  <div className="text-muted font-size-sm">
                    {moment(item.CreateDate).format("DD/MM/YYYY")}
                  </div>
                  <div className="fw-700">{item.Value} Kg</div>
                </div>
                <div className="d-flex">
                  <div
                    className="w-32px h-32px bg-success rounded-circle text-white d-flex justify-content-center align-items-center"
                    onClick={() => onEdit(item)}
                  >
                    <i className="las la-pen font-size-md"></i>
                  </div>
                  <div
                    className="w-32px h-32px bg-danger rounded-circle text-white d-flex justify-content-center align-items-center ml-8px"
                    onClick={() => onDelete(item)}
                  >
                    <i className="las la-trash font-size-md"></i>
                  </div>
                </div>
              </div>
            ))}
          {(!data || data.length === 0) && (
            <div className="p-15px">Chưa có dữ liệu</div>
          )}
        </>
      )}
    </div>
  );
}

export default ReportKGList;