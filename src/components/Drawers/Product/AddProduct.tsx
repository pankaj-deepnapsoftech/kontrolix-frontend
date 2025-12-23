import React from "react";
import { colors } from "../../../theme/colors";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { BiX } from "react-icons/bi";

const AddProduct = () => {
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
          {/* Machine Type */}
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Resource Type
            </FormLabel>
            <Select
              className="rounded mt-2 border"
              placeholder="Select Resource Type"
              name="type"
              value={selectedType}
              options={[
                ...typeOptions,
                { value: "__add_new__", label: "+ Add New Type" },
              ]}
              styles={customStyles}
              onChange={(selected: any) => {
                if (selected?.value === "__add_new__") {
                  setShowNewTypeInput(true);
                } else {
                  setSelectedType(selected);
                  formik.setFieldValue("type", selected?.value || "");
                }
              }}
              onBlur={formik.handleBlur}
            />
            {showNewTypeInput && (
              <div className="mt-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.700"
                  mb={2}
                >
                  Add New Resource Type
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="Enter new type (e.g. Packaging)"
                    size="sm"
                    bg="white"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px #3182ce",
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddNewType();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleAddNewType}
                    disabled={!newType.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowNewTypeInput(false);
                      setNewType("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </FormControl>

          {/* Name */}
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Name
            </FormLabel>
            <Input
              name="name"
              value={formik.values.name}
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

          {/* Specification */}
          <FormControl className="mt-3 mb-5">
            <FormLabel fontWeight="bold" color="gray.700" IsRequired>
              Specification
            </FormLabel>
            <Textarea
              required={true}
              name="specification"
              value={formik.values.specification}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Specification"
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

export default AddProduct;
