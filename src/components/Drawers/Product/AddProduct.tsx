// @ts-nocheck

import React, { useEffect, useState } from "react";
import { colors } from "../../../theme/colors";
import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Select from "react-select";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import axios from "axios";
import { useCookies } from "react-cookie";

interface Resource {
  _id: string;
  type: string;
  name: string;
  specification?: string;
}

interface Product {
  _id: string;
  productName: string;
  resource: string | Resource;
}

interface AddProductProps {
  closeDrawerHandler: () => void;
  onProductCreated?: (product: Product) => void;
  onProductUpdated?: (product: Product) => void;
  fetchProductsHandler?: () => void;
  editProduct?: Product | null;
}

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "white",
    borderColor: "#d1d5db",
    color: "#374151",
    minHeight: "40px",
    "&:hover": {
      borderColor: "#9ca3af",
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#e5e7eb" : "white",
    color: "#374151",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: "white",
    border: "1px solid #d1d5db",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9ca3af",
  }),
};

const AddProduct = ({
  closeDrawerHandler,
  onProductCreated,
  onProductUpdated,
  fetchProductsHandler,
  editProduct,
}: AddProductProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cookies] = useCookies();
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceOptions, setResourceOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedResource, setSelectedResource] = useState<{
    value: string;
    label: string;
  } | null>(null);

  // Fetch resources on mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}resources`,
          {
            headers: {
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );
        const resourceList = res.data.resources || res.data || [];
        setResources(resourceList);
        const options = resourceList.map((r: Resource) => ({
          value: r._id,
          label: `${r.name} (${r.type})`,
        }));
        setResourceOptions(options);

        // If editing, set the selected resource
        if (editProduct?.resource) {
          const resourceId =
            typeof editProduct.resource === "string"
              ? editProduct.resource
              : editProduct.resource._id;
          const match = options.find((opt: any) => opt.value === resourceId);
          if (match) {
            setSelectedResource(match);
          }
        }
      } catch (error) {
        toast.error("Failed to fetch resources");
      }
    };
    fetchResources();
  }, [cookies?.access_token, editProduct]);

  const formik = useFormik({
    initialValues: {
      productName: editProduct?.productName || "",
      resource:
        typeof editProduct?.resource === "string"
          ? editProduct?.resource
          : editProduct?.resource?._id || "",
    },
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (!values.productName.trim()) {
        toast.error("Please enter a product name");
        return;
      }
      if (!values.resource) {
        toast.error("Please select a resource");
        return;
      }

      try {
        setIsSubmitting(true);

        let res;
        if (editProduct) {
          res = await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}products/${editProduct._id}`,
            values,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          toast.success("Product updated successfully");

          if (onProductUpdated) {
            onProductUpdated(res.data.product);
          }
        } else {
          res = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}products/`,
            values,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          toast.success("Product created successfully");

          if (onProductCreated) {
            onProductCreated(res.data.product);
          }
        }

        if (fetchProductsHandler) {
          fetchProductsHandler();
        }

        resetForm();
        closeDrawerHandler();
      } catch (error) {
        toast.error("Failed to create/update product");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[99vw] md:w-[450px] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <div
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: colors.border.light }}
      >
        <h1
          className="text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          {editProduct ? "Edit Product" : "Add New Product"}
        </h1>
        <button
          onClick={closeDrawerHandler}
          className="p-2  transition-colors duration-200"
          style={{
            color: colors.text.secondary,
            backgroundColor: colors.gray[100],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[200];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[100];
          }}
        >
          <BiX size={20} />
        </button>
      </div>

      <div className="mt-8 px-5">
        <form onSubmit={formik.handleSubmit}>
          {/* Product Name */}
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Product Name
            </FormLabel>
            <Input
              name="productName"
              value={formik.values.productName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              type="text"
              placeholder="Enter product name"
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce",
              }}
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>

          {/* Select Resource */}
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Select Resource
            </FormLabel>
            <Select
              className=" mt-2 border"
              placeholder="Select a resource"
              name="resource"
              value={selectedResource}
              options={resourceOptions}
              styles={customStyles}
              onChange={(selected: any) => {
                setSelectedResource(selected);
                formik.setFieldValue("resource", selected?.value || "");
              }}
              onBlur={formik.handleBlur}
              isClearable
            />
          </FormControl>

          <Button
            isLoading={isSubmitting}
            type="submit"
            className="mt-5"
            colorScheme="blue"
            size="md"
            width="full"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
