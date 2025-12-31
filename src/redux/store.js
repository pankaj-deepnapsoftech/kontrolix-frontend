import { configureStore } from "@reduxjs/toolkit";
import {
  agentApi,
  api,
  bomApi,
  dispatchApi,
  employeeApi,
  invoiceApi,
  paymentApi,
  processApi,
  productApi,
  proformaInvoiceApi,
  requestApi,
  storeApi,
  userRoleApi,
} from "./api/api";
import authSlice from "./reducers/authSlice";
import drawersSlice from "./reducers/drawersSlice";

const store = configureStore({
  reducer: {
    [authSlice.name]: authSlice.reducer,
    [drawersSlice.name]: drawersSlice.reducer,
    [api.reducerPath]: api.reducer,
    [processApi.reducerPath]: processApi.reducer, // ✅ ADD THIS
    // (optional) others like:
    [productApi.reducerPath]: productApi.reducer,
    [storeApi.reducerPath]: storeApi.reducer,
    [agentApi.reducerPath]: agentApi.reducer,
    [bomApi.reducerPath]: bomApi.reducer,
    [userRoleApi.reducerPath]: userRoleApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [requestApi.reducerPath]: requestApi.reducer,
    [proformaInvoiceApi.reducerPath]: proformaInvoiceApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [dispatchApi.reducerPath]: dispatchApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      api.middleware,
      productApi.middleware,
      storeApi.middleware,
      agentApi.middleware,
      bomApi.middleware,
      userRoleApi.middleware,
      employeeApi.middleware,
      requestApi.middleware,
      proformaInvoiceApi.middleware,
      invoiceApi.middleware,
      processApi.middleware,
      paymentApi.middleware,
      dispatchApi.middleware,
    ]),
});


export default store;
