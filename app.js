const axios = require("axios");
const crypto = require("crypto");
const FormData = require("form-data");
const dotenv = require("dotenv");
dotenv.config();

const PAYTR_CALLBACK_URL = process.env.PAYTR_CALLBACK_URL;
const PAYTR_HOST = process.env.PAYTR_HOST;
const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID;
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

class PaytrTokenError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "PaytrTokenError";
  }
}

class PayTr {
  constructor(
    host,
    merchant_id,
    merchant_key,
    merchant_salt,
    successWebHookUrl,
    failedWebHookUrl
  ) {
    this.host = host;
    this.merchant_id = merchant_id;
    this.merchant_key = merchant_key;
    this.merchant_salt = merchant_salt;
    this.successWebHookUrl = successWebHookUrl;
    this.failedWebHookUrl = failedWebHookUrl;
  }

  async request(method, url, data, contentType = "application/json") {
    let _data = data;
    if (contentType === "multipart/form-data") {
      _data = new FormData();

      for (const key in data) {
        _data.append(key, data[key]);
      }
    }

    const response = await axios({
      method,
      url: this.host + url,
      data: _data,
      headers: {
        "Content-Type": contentType,
      },
    });
    return response.data;
  }

  genToken(data) {
    const token =
      Object.values(data).reduce((acc, value) => acc + value, "") +
      this.merchant_salt;

    console.log("token: ", token);

    return crypto
      .createHmac("sha256", this.merchant_key)
      .update(token)
      .digest("base64");
  }

  async listCards(data) {
    const paytr_token = this.genToken({ utoken: data.utoken });
    data.paytr_token = paytr_token;
    data.merchant_id = this.merchant_id;
    return this.request(
      "POST",
      "/odeme/capi/list",
      data,
      "application/x-www-form-urlencoded"
    );
  }

  async removeCard(data) {
    const paytr_token = this.genToken({
      ctoken: data.ctoken,
      utoken: data.utoken,
    });
    data.paytr_token = paytr_token;
    data.merchant_id = this.merchant_id;
    return this.request(
      "POST",
      "/odeme/capi/delete",
      data,
      "application/x-www-form-urlencoded"
    );
  }

  async paymentNoCardStoring(data) {
    const paytr_token = this.genToken({
      merchant_id: this.merchant_id,
      user_ip: data.user_ip,
      merchant_oid: data.merchant_oid,
      email: data.email,
      payment_amount: data.payment_amount,
      payment_type: "card",
      installment_count: data.installment_count,
      test_mode: data.test_mode,
      non_3d: data.non_3d,
    });

    data.merchant_fail_url = this.failedWebHookUrl;
    data.merchant_ok_url = this.failedWebHookUrl;
    data.paytr_token = paytr_token;
    data.merchant_id = this.merchant_id;

    return this.request("POST", "/odeme", data, "multipart/form-data");
  }

  async paymentStoreCard(data) {
    const paytr_token = this.genToken({
      merchant_id: this.merchant_id,
      user_ip: data.user_ip,
      merchant_oid: data.merchant_oid,
      email: data.email,
      payment_amount: data.payment_amount,
      payment_type: "card",
      installment_count: data.installment_count,
      test_mode: data.test_mode,
      non_3d: data.non_3d,
    });

    data.merchant_fail_url = this.failedWebHookUrl;
    data.merchant_ok_url = this.failedWebHookUrl;
    data.paytr_token = paytr_token;
    data.merchant_id = this.merchant_id;
    data.store_card = 1;

    return this.request("POST", "/odeme", data, "multipart/form-data");
  }

  async paymentRecuring(data) {
    const paytr_token = this.genToken({
      merchant_id: this.merchant_id,
      user_ip: data.user_ip,
      merchant_oid: data.merchant_oid,
      email: data.email,
      payment_amount: data.payment_amount,
      payment_type: "card",
      installment_count: data.installment_count,
      test_mode: data.test_mode,
      non_3d: data.non_3d,
    });

    data.merchant_fail_url = this.failedWebHookUrl;
    data.merchant_ok_url = this.failedWebHookUrl;
    data.paytr_token = paytr_token;
    data.merchant_id = this.merchant_id;
    data.non_3d = 1;
    data.recurring_payment = 1;

    return this.request("POST", "/odeme", data, "multipart/form-data");
  }

  callBack(request) {
    const token = this.genToken({
      merchant_oid: request.merchant_oid,
      merchant_salt: this.merchant_salt,
      status: request.status,
      total_amount: request.total_amount,
    });

    if (token !== request.hash) {
      throw new PaytrTokenError("Invalid Hash");
    }

    if (request.status === "success") {
      return true;
    }
    return false;
  }

  async payment(data) {
    const paytr_token = this.genToken({
      merchant_id: this.merchant_id,
      user_ip: data.user_ip,
      merchant_oid: data.merchant_oid,
      email: data.email,
      payment_amount: data.payment_amount,
      payment_type: "card",
      installment_count: data.installment_count,
      currency: data.currency,
      test_mode: data.test_mode,
      non_3d: data.non_3d,
    });

    console.log("token: ", paytr_token);

    data.merchant_id = this.merchant_id;
    data.paytr_token = paytr_token;

    return this.request("POST", "/odeme", data, "multipart/form-data");
  }
}

const paymentService = new PayTr(
  PAYTR_HOST,
  PAYTR_MERCHANT_ID,
  PAYTR_MERCHANT_KEY,
  PAYTR_MERCHANT_SALT,
  PAYTR_CALLBACK_URL,
  PAYTR_CALLBACK_URL
);

module.exports = {
  PayTr,
  PaytrTokenError,
  paymentService,
};

// Prepare payment data
const paymentData = {
  user_ip: "127.0.0.1",
  merchant_oid: "test12345", //Math.floor(Math.random() * 9000) + 1000,
  email: "customer@example.com",
  payment_type: "card",
  payment_amount: 100, // Amount in your currency
  currency: "TL",
  test_mode: "1", // Test mode enabled (change to 0 for production)
  non_3d: "0", // Non-3D secure transaction (change to 1 for non-3D secure)
  merchant_ok_url: "http://example.com/success", // URL to redirect after successful payment
  merchant_fail_url: "http://example.com/failure", // URL to redirect after failed payment
  user_name: "Customer Name",
  user_address: "Customer Address",
  user_phone: "1234567890",
  user_basket: JSON.stringify([
    ["Örnek Ürün 1", "18.00", 1],
    ["Örnek Ürün 2", "33.25", 2],
    ["Örnek Ürün 3", "45.42", 1],
  ]), // Product 2 // Example basket items (change accordingly)
  debug_on: 1, // Debug mode enabled (change to 0 for disable)
  client_lang: "tr", // Language of the page ("en" or "tr")
  installment_count: "0", // Number of installments (if any)
  cc_owner: "PAYTR TEST",
  card_number: "9792030394440796", // Example card number (change to actual card number)
  expiry_month: "12", // Example expiry month (change to actual expiry month)
  expiry_year: "25", // Example expiry year (change to actual expiry year)
  cvv: "000", // Example CVV (change to actual CVV)
  sync_mode: "0",
  no_installment: "0",
  max_installment: "0",
  lang: "tr",
};

console.log("merchant_oid: ", paymentData.merchant_oid);

// Make the payment
paymentService
  .payment(paymentData)
  .then((response) => {
    // Handle payment response
    console.log(response);
    // Depending on the response status, redirect the user to appropriate page
    if (response.status === "success") {
      // Payment successful
      // Redirect user to success page
      console.log("Payment successful");
    } else if (response.status === "failed") {
      // Payment failed
      // Redirect user to failure page
      console.log("Payment failed");
    } else if (response.status === "wait_callback") {
      // Waiting for callback (usually for asynchronous payments)
      // Redirect user to a waiting page or show appropriate message
      console.log("Waiting for callback");
    }
  })
  .catch((error) => {
    // Handle any errors
    console.error("Error making payment:", error.message);
  });
