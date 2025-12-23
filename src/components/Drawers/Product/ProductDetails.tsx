// @ts-nocheck

import React, { useEffect, useState } from "react";
import { colors } from "../../../theme/colors";
import { Spinner, Badge } from "@chakra-ui/react";
import { BiX } from "react-icons/bi";
import { FiPackage, FiSettings, FiCalendar, FiHash } from "react-icons/fi";
import { toast } from "react-toastify";
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
  product_id?: string;
  productName: string;
  resource: Resource;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductDetailsProps {
  closeDrawerHandler: () => void;
  productId?: string;
}

const ProductDetails = ({
  closeDrawerHandler,
  productId,
}: ProductDetailsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cookies] = useCookies();
  const [product, setProduct] = useState<Product | null>(null);

  // Fetch product details on mount
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}product/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );
        setProduct(response.data.product || response.data);
      } catch (error) {
        toast.error("Failed to fetch product details");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [cookies?.access_token, productId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div
        className="absolute overflow-auto h-[100vh] w-[99vw] md:w-[450px] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200 flex items-center justify-center"
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
        }}
      >
        <Spinner size="xl" color="blue.500" />
      </div>
    );
  }

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[99vw] md:w-[450px] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: colors.border.light }}
      >
        <h1
          className="text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          Product Details
        </h1>
        <button
          onClick={closeDrawerHandler}
          className="p-2 transition-colors duration-200"
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

      {/* Content */}
      <div className="p-6">
        {product ? (
          <div className="space-y-6">
            {/* Product Name Card */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FiPackage size={20} style={{ color: colors.text.secondary }} />
                <div>
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Product Name
                  </p>
                  <p
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    {product.productName || "N/A"}
                  </p>
                </div>
            </div>

            {/* Product ID */}
            {product.product_id && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FiHash size={20} style={{ color: colors.text.secondary }} />
                <div>
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Product ID
                  </p>
                  <p
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    {product.product_id}
                  </p>
                </div>
              </div>
            )}

            {/* Category */}
            {product.category && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FiPackage size={20} style={{ color: colors.text.secondary }} />
                <div>
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Category
                  </p>
                  <p fontSize="sm" mt={1}>
                    {product.category}
                  </p>
                </div>
              </div>
            )}

            {/* Resource Details */}
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: colors.gray[50],
                borderColor: colors.border.light,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FiSettings size={18} />
                <h3
                  className="font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Linked Resource
                </h3>
              </div>
              {product.resource ? (
                <div className="space-y-3 ml-6">
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      Resource Name
                    </p>
                    <p
                      className="font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      {product.resource.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      Resource Type
                    </p>
                    <Badge fontSize="sm" mt={1}>
                      {product.resource.type || "N/A"}
                    </Badge>
                  </div>
                  {product.resource.specification && (
                    <div>
                      <p
                        className="text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        Specification
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{ color: colors.text.primary }}
                      >
                        {product.resource.specification}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p
                  className="text-sm ml-6"
                  style={{ color: colors.text.secondary }}
                >
                  No resource linked
                </p>
              )}
            </div>

            {/* Timestamps */}
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: colors.gray[50],
                borderColor: colors.border.light,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FiCalendar size={18} />
                <h3
                  className="font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Timestamps
                </h3>
              </div>
              <div className="space-y-3 ml-6">
                <div>
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Created At
                  </p>
                  <p
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    {formatDate(product.createdAt)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Last Updated
                  </p>
                  <p
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    {formatDate(product.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p style={{ color: colors.text.secondary }}>
              Product not found or unable to load details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
