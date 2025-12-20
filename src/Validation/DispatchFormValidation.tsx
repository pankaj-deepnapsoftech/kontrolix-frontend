//@ts-nocheck
import * as Yup from "yup";

export const DispatchFormSchema = Yup.object({
  sales_order_id: Yup.string().required("Please select a sales order"),
  tracking_id: Yup.string(),
  tracking_web: Yup.string()
    .url("Please enter a valid URL"),
  dispatch_date: Yup.date().required("Please select dispatch date"),
  courier_service: Yup.string(),
  remarks: Yup.string(),
  dispatch_qty: Yup.number()
    .typeError("Dispatch quantity must be a number")
    .integer("Dispatch quantity must be an integer")
    .positive("Dispatch quantity must be greater than zero")
    .required("Dispatch quantity is required"),
});
