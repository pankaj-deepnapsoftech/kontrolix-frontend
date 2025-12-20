// @ts-nocheck

import { toast } from "react-toastify";
import Drawer from "../../../ui/Drawer";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import Loading from "../../../ui/Loading";
import { BiX } from "react-icons/bi";

interface PaymentDetailsProps {
  closeDrawerHandler: (id: string) => void;
  id: string | undefined;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  closeDrawerHandler,
  id,
}) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [invoiceNo, setInvoiceNo] = useState<string | undefined>();
  const [mode, setMode] = useState<string | undefined>();
  const [amount, setAmount] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [subtotal, setSubtotal] = useState<number | undefined>();
  const [taxAmount, setTaxAmount] = useState<number | undefined>();
  const [taxName, setTaxName] = useState<string | undefined>();
  const [total, setTotal] = useState<number | undefined>();
  const [balance, setBalance] = useState<number | undefined>();

  const [buyerEmail, setBuyerEmail] = useState<string | undefined>();
  const [buyerContact, setBuyerContact] = useState<string | undefined>();
  const [buyerCompany, setBuyerCompany] = useState<string | undefined>();
  const [buyerConsigneeNames, setBuyerConsigneeNames] = useState<string[]>([]);

  const fetchPaymentDetails = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `payment/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      const payment = data.payment;
      const invoice = payment.invoice;
      const buyer = invoice.buyer;

      console.log("Payment Details Invoice:", invoice);
      console.log("Current Balance:", invoice.balance);

      setInvoiceNo(invoice.invoice_no);
      setMode(payment.mode);
      setDescription(payment?.description);
      setAmount(payment.amount);

      setBuyerEmail(buyer.email_id?.[0]);
      setBuyerContact(buyer.contact_number?.[0]);
      setBuyerCompany(buyer.company_name);
      setBuyerConsigneeNames(buyer.consignee_name || []);

      setSubtotal(invoice.subtotal);
      setTaxAmount(invoice.tax?.tax_amount);
      setTaxName(invoice.tax?.tax_name);
      setTotal(invoice.total);
      setBalance(invoice.balance);

      // Double-check the balance by fetching the current invoice directly
      // This ensures we have the most up-to-date balance
      try {
        const invoiceResponse = await fetch(
          process.env.REACT_APP_BACKEND_URL + `invoice/${invoice._id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );
        const invoiceData = await invoiceResponse.json();
        if (invoiceData.success && invoiceData.invoice) {
          console.log("Direct invoice balance:", invoiceData.invoice.balance);
          setBalance(invoiceData.invoice.balance);
        }
      } catch (invoiceError) {
        console.log("Could not fetch direct invoice balance:", invoiceError);
        // Continue with the balance from payment response
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails(id || "");
  }, [id]);

  return (
    // @ts-ignore
    <div
      className="absolute overflow-auto h-[100vh] w-[90vw] md:w-[450px] bg-white right-0 top-0 z-10 py-3"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <h1 className="px-4 flex gap-x-2 items-center text-xl py-3 border-b">
        {/* @ts-ignore */}
        <BiX onClick={closeDrawerHandler} size="26px" />
        Payment
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-2xl font-semibold py-5 text-center mb-6 border-y bg-[#f9fafc]">
          Payment Details
        </h2>

        {isLoading && <Loading />}
        {!isLoading && (
          <div>
            {/* Existing Payment Info */}
            <div className="mt-3 mb-5">
              <p className="font-semibold">Invoice No.</p>
              <p>{invoiceNo}</p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-semibold">Paid Amount</p>
              <p>₹ {amount}/-</p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-semibold">Mode</p>
              <p>{mode}</p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-semibold">Description</p>
              <p>{description || "N/A"}</p>
            </div>

            {/* New Buyer Info */}
            <h2 className="text-xl font-semibold py-3 mt-6 border-b">
              Buyer Details
            </h2>

            {/* <div className="mt-3 mb-5">
              <p className="font-semibold">Contact Person</p>
              <p>{buyerName || 'N/A'}</p>
            </div> */}
            <div className="mt-3 mb-5">
              <p className="font-semibold">Email</p>
              <p>{buyerEmail || "N/A"}</p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-semibold">Contact Number</p>
              <p>{buyerContact || "N/A"}</p>
            </div>
            {buyerCompany ? (
              <div className="mt-3 mb-5">
                <p className="font-semibold">Company</p>
                <p>{buyerCompany}</p>
              </div>
            ) : buyerConsigneeNames && buyerConsigneeNames.length > 0 ? (
              <div className="mt-3 mb-5">
                <p className="font-semibold">Consignee Name</p>
                {buyerConsigneeNames.map((name, index) => (
                  <p key={index}>{name}</p>
                ))}
              </div>
            ) : null}
            <h2 className="text-xl font-semibold py-3 mt-6 border-b">
              Invoice Summary
            </h2>

            <div className="mt-3 mb-5">
              <p className="font-semibold">Subtotal</p>
              <p>₹ {subtotal?.toFixed(2) || "0.00"}</p>
            </div>
            {taxName && (
              <div className="mt-3 mb-5">
                <p className="font-semibold">Tax ({taxName})</p>
                <p>
                  ₹{" "}
                  {subtotal && taxAmount
                    ? (subtotal * taxAmount).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            )}
            <div className="mt-3 mb-5">
              <p className="font-semibold">Total</p>
              <p>₹ {total?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="mt-3 mb-5">
              <p className="font-semibold">Balance (Remaining)</p>
              <p>₹ {balance?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetails;
