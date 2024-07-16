import BigNumber from "bignumber.js";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import "moment/locale/pt-br";
import moment from "moment";

import { BottomNavbar } from "../components/bottom-navbar";
import { useNotification } from "../contexts/notification";
import { useEffect, useState } from "react";
import { NotificationUtil } from "../utils/notification";

BigNumber.config({
  FORMAT: {
    // decimal separator
    decimalSeparator: ',',
    // grouping separator of the integer part
    groupSeparator: '.',
  }
});

moment().locale('pt-br')

interface CustomProps {
  children: any
}

export function Layout({ children }: CustomProps) {

  return (
    <>
      <Header />
      {children}
      <Footer />
      <BottomNavbar />
      <Notifications />
    </>
  );
}

function Notifications() {
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
    }
  }, [])

  return (
    <div className={`toast ${show && 'show'}`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-header">
        <strong className="me-auto">Bootstrap</strong>
        <small className="text-body-secondary">just now</small>
        <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" onClick={e => setShow(false)}></button>
      </div>
      <div className="toast-body">
        {item.message}
      </div>
    </div>
  );
}

