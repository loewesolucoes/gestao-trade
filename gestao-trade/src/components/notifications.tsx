import { useNotification } from "../contexts/notification";
import { useEffect, useState } from "react";
import { NotificationUtil } from "../utils/notification";

export function Notifications() {
  const { notifications } = useNotification();

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      {notifications.map((x, i) => (
        <NotificationItem key={i} item={x} />
      ))}
    </div>
  );
}
function NotificationItem({ item }: any) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(false), NotificationUtil.TIME_TO_CLOSE_NOTIFICATION);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className={`toast ${show && 'show'}`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-header">
        <strong className="me-auto">{process.env.REACT_APP_TITLE}</strong>
        {/* <small className="text-body-secondary">just now</small> */}
        <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" onClick={e => setShow(false)}></button>
      </div>
      <div className="toast-body" dangerouslySetInnerHTML={{ __html: item.message }} />
    </div>
  );
}
