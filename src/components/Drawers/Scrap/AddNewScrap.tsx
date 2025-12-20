// @ts-nocheck

import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import Select from "react-select";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { colors } from "../../../theme/colors";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import axios from "axios";
import { useCookies } from "react-cookie";

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

const AddNewScrap = ({
  onScrapCreated,
  closeDrawerHandler,
  fetchScrapsHandler,
  editScrap,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cookies] = useCookies();
  const [localEditScrap] = useState(editScrap);
  const [directOrIndirect, setDirectOrIndirect] = useState();
  const [categories, setCategories] = useState([]);
  const [selectedUOM, setSelectedUOM] = useState();

  const directOrIndirectOption = [
    { value: "direct", label: "Direct" },
    { value: "indirect", label: "Indirect" },
  ];

  const uomOptions = [
    { value: "pcs", label: "pcs" },
    { value: "kgs", label: "kgs" },
    { value: "g", label: "g" },
    { value: "mg", label: "mg" },
    { value: "ltr", label: "ltr" },
    { value: "ml", label: "ml" },
    { value: "tonne", label: "tonne" },
    { value: "cm", label: "cm" },
    { value: "mm", label: "mm" },
    { value: "inch", label: "inch" },
    { value: "ft", label: "ft" },
    { value: "mtr", label: "mtr" },
    { value: "sqft", label: "sqft" },
    { value: "sqm", label: "sqm" },
    { value: "cbm", label: "cbm" },
    { value: "cft", label: "cft" },
    { value: "dozen", label: "dozen" },
    { value: "pack", label: "pack" },
    { value: "set", label: "set" },
    { value: "roll", label: "roll" },
    { value: "box", label: "box" },
    { value: "bag", label: "bag" },
    { value: "pair", label: "pair" },
    { value: "sheet", label: "sheet" },
    { value: "tube", label: "tube" },
    { value: "bottle", label: "bottle" },
    { value: "container", label: "container" },
  ];

  const formik = useFormik({
    initialValues: localEditScrap || {
      Scrap_name: "",
      Scrap_id: "",
      price: "",
      Extract_from: "",
      Category: "",
      qty: "",
      description: "",
      uom: "",
    },
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (!directOrIndirect?.value) {
        toast.error("Please select Extract From");
        return;
      }
      if (!categories.find((cat) => cat.value === values.Category)) {
        toast.error("Please select a valid category");
        return;
      }
      if (!selectedUOM?.value) {
        toast.error("Please select UOM (Unit of Measurement)");
        return;
      }

      const submitData = {
        Scrap_name: values.Scrap_name,
        price: parseFloat(values.price) || 0,
        Extract_from: directOrIndirect.value,
        Category: values.Category,
        qty: parseFloat(values.qty) || 0,
        description: values.description,
        uom: selectedUOM.value,
      };

      try {
        setIsSubmitting(true);

        let res;
        if (localEditScrap) {
          res = await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}scrap/update/${localEditScrap._id}`,
            submitData,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          toast.success("Scrap updated successfully");

          fetchScrapsHandler();
        } else {
          res = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}scrap/create`,
            submitData,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          toast.success("Scrap created successfully");

          if (onScrapCreated) {
            onScrapCreated(res.data.data);
          }
        }

        if (onScrapCreated) {
          onScrapCreated(res.data.data);
        }

        console.log(res.data);
        resetForm();
        closeDrawerHandler();
      } catch (error) {
        toast.error("Failed to create/update Scrap");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}product/all`,
          {
            headers: {
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );

        const rawMaterialProducts = response.data.products
          .filter((product) => product.category === "raw materials")
          .map((product) => ({
            value: product.name,
            label: product.name,
            inventory_category: product.inventory_category,
          }));

        setCategories(rawMaterialProducts);
      } catch (error) {
        toast.error("Failed to fetch raw material products");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (editScrap) {
      if (editScrap.Extract_from) {
        const extractOption = directOrIndirectOption.find(
          (opt) => opt.value === editScrap.Extract_from
        );
        if (extractOption) {
          setDirectOrIndirect(extractOption);
        }
      }
      if (editScrap.uom) {
        const uomOption = uomOptions.find((opt) => opt.value === editScrap.uom);
        if (uomOption) {
          setSelectedUOM(uomOption);
        }
      }
    }
  }, [editScrap]);

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
          {editScrap ? "Edit Scrap" : "Add New Scrap"}
        </h1>
        <button
          onClick={closeDrawerHandler}
          className="p-2 rounded-lg transition-colors duration-200"
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
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Name
            </FormLabel>
            <Input
              name="Scrap_name"
              value={formik.values.Scrap_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              type="text"
              placeholder="Name"
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce",
              }}
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>

          <FormControl className="mt-3 mb-5">
            <FormLabel fontWeight="bold" color="gray.700">
              Price
            </FormLabel>
            <Input
              name="price"
              value={formik.values.price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              type="number"
              placeholder="Price"
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce",
              }}
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>

          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Category
            </FormLabel>
            <Select
              className="rounded mt-2 border"
              placeholder="Select Category"
              value={categories.find(
                (cat) => cat.value === formik.values.Category
              )}
              options={categories}
              onChange={(option: any) => {
                formik.setFieldValue("Category", option?.value || "");

                if (option?.inventory_category) {
                  const extractFromOption = directOrIndirectOption.find(
                    (opt) => opt.value === option.inventory_category
                  );
                  if (extractFromOption) {
                    setDirectOrIndirect(extractFromOption);
                  }
                }
              }}
            />
          </FormControl>

          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Extract From
            </FormLabel>
            <Select
              className="rounded mt-2 border"
              placeholder="Select Extract From"
              value={directOrIndirect}
              options={directOrIndirectOption}
              onChange={(e: any) => setDirectOrIndirect(e)}
            />
          </FormControl>

          <FormControl className="mt-3 mb-5">
            <FormLabel fontWeight="bold" color="gray.700">
              Quantity
            </FormLabel>
            <Input
              name="qty"
              value={formik.values.qty}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              type="number"
              placeholder="Quantity"
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce",
              }}
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>

          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Unit of Measurement (UOM)
            </FormLabel>
            <Select
              className="rounded mt-2 border"
              placeholder="Select UOM"
              value={selectedUOM}
              options={uomOptions}
              onChange={(e: any) => setSelectedUOM(e)}
              styles={customStyles}
            />
          </FormControl>

          <FormControl className="mt-3 mb-5">
            <FormLabel fontWeight="bold" color="gray.700">
              Remarks
            </FormLabel>
            <Textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Remarks/Description"
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce",
              }}
              _placeholder={{ color: "gray.500" }}
              rows={4}
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

export default AddNewScrap;
