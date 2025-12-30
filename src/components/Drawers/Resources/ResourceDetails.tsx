// @ts-nocheck

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import Loading from "../../../ui/Loading";
import { colors } from "../../../theme/colors";
import { FiPackage, FiSettings, FiCalendar, FiHash } from "react-icons/fi";
import axios from "axios";

interface ResourceDetailsProps {
  closeDrawerHandler: () => void;
  resourceId: string | undefined;
}

const ResourceDetails: React.FC<ResourceDetailsProps> = ({
  closeDrawerHandler,
  resourceId,
}) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resource, setResource] = useState<any>(null);

  const fetchResourceDetailsHandler = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}resources/${resourceId}`,
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      setResource(response.data.resource || response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch resource details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resourceId) {
      fetchResourceDetailsHandler();
    }
  }, [resourceId, cookies?.access_token]);

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
        <Loading />
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
      <div
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: colors.border.light }}
      >
        <h1
          className="text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          Resource Details
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

      <div className="p-6">
        {resource ? (
          <div className="space-y-6">
            {/* Resource Name */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiPackage size={20} style={{ color: colors.text.secondary }} />
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
                  {resource.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Custom ID */}
            {resource.customId && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FiHash size={20} style={{ color: colors.text.secondary }} />
                <div>
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Custom ID
                  </p>
                  <p
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    {resource.customId}
                  </p>
                </div>
              </div>
            )}

            {/* Type */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiSettings size={20} style={{ color: colors.text.secondary }} />
              <div>
                <p
                  className="text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  Type
                </p>
                <p
                  className="font-medium"
                  style={{ color: colors.text.primary }}
                >
                  {resource.type || "N/A"}
                </p>
              </div>
            </div>

            {/* Specification */}
            {resource.specification && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p
                  className="text-sm mb-2"
                  style={{ color: colors.text.secondary }}
                >
                  Specification
                </p>
                <p
                  className="font-medium"
                  style={{ color: colors.text.primary }}
                >
                  {resource.specification}
                </p>
              </div>
            )}

            {/* Created At */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiCalendar size={20} style={{ color: colors.text.secondary }} />
              <div>
                <p
                  className="text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  Created On
                </p>
                <p
                  className="font-medium"
                  style={{ color: colors.text.primary }}
                >
                  {formatDate(resource.createdAt)}
                </p>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiCalendar size={20} style={{ color: colors.text.secondary }} />
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
                  {formatDate(resource.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p style={{ color: colors.text.secondary }}>
              Resource not found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDetails;

