import BigNumber from "bignumber.js";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import "moment/locale/pt-br";
import moment from "moment";

import { BottomNavbar } from "../components/bottom-navbar";

BigNumber.config({
  FORMAT: {
    // decimal separator
    decimalSeparator: ',',
    // grouping separator of the integer part
    groupSeparator: '.',
  }
});

moment().locale('pt-br')

export function Layout({ children }: any) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <BottomNavbar />
    </>
  );
}

