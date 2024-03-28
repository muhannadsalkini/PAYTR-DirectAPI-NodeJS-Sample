# PAYTR-DirectAPI-NodeJS-Sample

This repository contains a Node.js implementation for integrating with PAYTR Direct API for processing payments. This implementation provides functionalities for generating payment tokens, handling callbacks, and initiating payments.

## Prerequisites

Before using this code, ensure you have the following:

- Node.js installed on your system.
- PAYTR Direct API credentials (merchant ID, merchant key, merchant salt).
- Environment variables set up in a `.env` file for PAYTR callback URL, host, merchant ID, merchant key, and merchant salt.

## Installation

1. Clone this repository to your local machine:

   ```bash
   git clone <repository_url>
   ```

2. Navigate to the cloned directory:

   ```bash
   cd PAYTR-DirectAPI-NodeJS-Sample
   ```

3. Install dependencies using npm:

   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory of the project.

2. Add the following environment variables to the `.env` file:

   ```
   PAYTR_CALLBACK_URL=your_callback_url
   PAYTR_HOST=paytr_host_url
   PAYTR_MERCHANT_ID=your_merchant_id
   PAYTR_MERCHANT_KEY=your_merchant_key
   PAYTR_MERCHANT_SALT=your_merchant_salt
   ```

   Replace `your_callback_url`, `paytr_host_url`, `your_merchant_id`, `your_merchant_key`, and `your_merchant_salt` with your actual PAYTR Direct API credentials and callback URL.

## Usage

You can utilize the provided `PayTr` class and `paymentService` instance to interact with PAYTR Direct API for payment processing.

1. Initialize the `PayTr` class with your PAYTR credentials and callback URLs:

   ```javascript
   const paymentService = new PayTr(
     PAYTR_HOST,
     PAYTR_MERCHANT_ID,
     PAYTR_MERCHANT_KEY,
     PAYTR_MERCHANT_SALT,
     PAYTR_CALLBACK_URL,
     PAYTR_CALLBACK_URL
   );
   ```

2. Prepare payment data according to your requirements.

3. Make a payment request using the `paymentService.payment()` method:

   ```javascript
   paymentService
     .payment(paymentData)
     .then((response) => {
       // Handle payment response
       // Redirect user or perform further actions based on the response status
     })
     .catch((error) => {
       // Handle errors
     });
   ```

Refer to the provided test script in the code for an example of how to make a payment request and handle the response.

## Testing

The provided test script demonstrates how to use the `paymentService` instance to make a payment request. You can uncomment and customize the `paymentData` object according to your test scenario and run the script to test payment processing.


---

Feel free to reach out if you have any questions or need further assistance. Happy coding! 🚀
