/**
 * 工具方法模块
 * @author  jerry
 * @Date 2018-10-14
 */
import { Alert, Platform, Linking } from "react-native";
import VersionNumber from "react-native-version-number";
import qs from 'qs';
import I18n from "../src/locales";

interface EmailProps {
  to: string;
  subject: string;
  body: string;  
}

function pad(n: number) {
  const s = n.toString();
  if (s.length === 1) {
    return "0" + s;
  }
  return s;
}

function month(n: number, full = false) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return full
    ? I18n.t(months[n], { defaultValue: months[n] })
    : I18n.t(months[n].substring(0, 3), {
      defaultValue: months[n].substring(0, 3)
    });
}

export default {
  objToQueryString(obj: { [key: string]: string }) {
    if (!obj) {
      return "";
    }
    const str = [];
    for (const p in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, p)) {
        str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
      }
    }
    return str.join("&");
  },

  /**
   * 格式化货币数字位数
   */
  round(value: string | number, digits = 2) {
    return parseFloat((Number(value) * 1).toFixed(digits));
  },
  /**
   * 格式化货币数字 1,234,567.00000000
   */
  formatCurrency(value: number | string) {
    return String(value).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
  },
  /**
   * 格式化货币数字 1,234,567
   */
  roundCurrency(value: number | string = 0) {
    const parts = value.toString().split(".");
    parts[0] = parts[0].replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
    return parts.join(".");
  },
  /**
   * 保留指定位数并格式化
   */
  assignCurrency(value: string | number, digits = 2) {
    return this.roundCurrency(this.round(value, digits));
  },

  showCurrencyString(value: string, isCrypto = false) {
    const numVal = Number(value);
    const decimals = isCrypto ? 8 : 2;
    const retVal = parseFloat(numVal.toFixed(decimals));
    return retVal > 0 ? retVal.toString() : "";
  },
  /* Show Native Alert */
  showAlert(message: string) {
    Alert.alert("RelayX", message, [{ text: "OK", style: "cancel" }]);
  },

  getAppVersion() {
    if (Platform.OS === "ios") {
      return `${VersionNumber.appVersion}.${VersionNumber.buildVersion}`;
    } else {
      return VersionNumber.appVersion;
    }
  },

  openUrlBrowser(url: string) {
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          console.log("Can't handle url: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error("An error occurred", err));
  },

  parseDate(string: string) {
    return new Date(string.replace(" ", "T") + "+08:00");
  },

  formatDate(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  },

  formatCalendar(date: Date) {
    const today = new Date();
    if (today.getTime() - date.getTime() < 1000 * 60 * 5) {
      return I18n.t("now");
    } else if (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    ) {
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } else if (today.getFullYear() === date.getFullYear()) {
      return `${month(date.getMonth())} ${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    return `${date.getFullYear()} ${month(date.getMonth())} ${pad(
      date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  },
  async sendEmail(props: EmailProps) {
    const { subject, body, to } = props;
    let url = `mailto:${to}`;
    const query = qs.stringify({
        subject,
        body,
    });
    if (query.length) {
        url += `?${query}`;
    }

    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
        throw new Error('Provided URL can not be handled');
    }

    const open = await Linking.openURL(url);

    return open
}
};
