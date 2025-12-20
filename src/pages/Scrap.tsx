// @ts-nocheck

import { Button } from "@chakra-ui/react";
import { MdOutlineRefresh } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import ScrapTable from "../components/Table/ScrapTable";
import { toast } from "react-toastify";
import { FiPlus, FiSearch } from "react-icons/fi";
import { AiFillFileExcel } from "react-icons/ai";
import { colors } from "../theme/colors";
import { Recycle } from "lucide-react";
import AddNewScrap from "../components/Drawers/Scrap/AddNewScrap";
import { RxCross2 } from "react-icons/rx";
import SampleCSV from "../assets/csv/parties-sample.csv";

const Scrap: React.FC = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState<any[] | []>([]);
  const [filteredData, setFilteredData] = useState<any[] | []>([]);
  const [isLoadingScraps, setIsLoadingScraps] = useState<boolean>(false);
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [isAddScrapDrawerOpened, setIsAddScrapDrawerOpened] = useState(false);
  const [editScrap, setEditScrap] = useState(null);
  const [showBulkUploadMenu, setShowBulkUploadMenu] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const fileRef = useRef(null);

  console.log("Limit:", limit);

  const fetchScrapHandler = async () => {
    try {
      setIsLoadingScraps(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL +
          `scrap/get?limit=${limit}&page=${page}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.message) {
        throw new Error(data.message || "Failed to fetch scraps");
      }

      const scrapData = Array.isArray(data.data) ? data.data : [];
      setData(scrapData);
      setFilteredData(scrapData);

      if (scrapData.length < limit) {
        setTotalRecords((page - 1) * limit + scrapData.length);
      } else {
        setTotalRecords(page * limit + 1);
      }
    } catch (error: any) {
      toast.error("Something went wrong");
    } finally {
      setIsLoadingScraps(false);
    }
  };

  const openAddScrapDrawerHandler = () => {
    setEditScrap(null);
    setIsAddScrapDrawerOpened(true);
  };

  const closeAddScrapDrawerHandler = () => {
    setIsAddScrapDrawerOpened(false);
    setEditScrap(null);
  };

  const handleScrapCreated = (newScrap) => {
    const formattedScrap = {
      _id: newScrap._id,
      Scrap_name: newScrap.Scrap_name || "",
      Scrap_id: newScrap.Scrap_id || "",
      price: newScrap.price || 0,
      Extract_from: newScrap.Extract_from || "",
      Category: newScrap.Category || "",
      qty: newScrap.qty || 0,
      uom: newScrap.uom || "",
      description: newScrap.description || "",
      createdAt: newScrap.createdAt || new Date().toISOString(),
      updatedAt: newScrap.updatedAt || new Date().toISOString(),
    };

    const updatedScraps = [formattedScrap, ...data];
    setData(updatedScraps);
    setFilteredData(updatedScraps);
  };

  const handleScrapUpdated = (updatedScrap) => {
    const formattedScrap = {
      _id: updatedScrap._id,
      Scrap_name: updatedScrap.Scrap_name || "",
      Scrap_id: updatedScrap.Scrap_id || "",
      price: updatedScrap.price || 0,
      Extract_from: updatedScrap.Extract_from || "",
      Category: updatedScrap.Category || "",
      qty: updatedScrap.qty || 0,
      uom: updatedScrap.uom || "",
      description: updatedScrap.description || "",
      createdAt: updatedScrap.createdAt || new Date().toISOString(),
      updatedAt: updatedScrap.updatedAt || new Date().toISOString(),
    };

    const updatedScraps = data.map((scrap) =>
      scrap._id === formattedScrap._id ? formattedScrap : scrap
    );
    setData(updatedScraps);
    setFilteredData(updatedScraps);
  };

  const handleEditScrap = (scrap) => {
    setEditScrap(scrap);
    setIsAddScrapDrawerOpened(true);
  };

  const handleDeleteScrap = async (scrapId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}scrap/delete/${scrapId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (response.ok) {
        const updatedScraps = data.filter((scrap) => scrap._id !== scrapId);
        setData(updatedScraps);
        setFilteredData(updatedScraps);
        toast.success("Scrap deleted successfully");
      } else {
        throw new Error("Failed to delete scrap");
      }
    } catch (error) {
      toast.error("Failed to delete scrap");
    }
  };

  useEffect(() => {
    fetchScrapHandler();
  }, [limit, page]);

  const bulkUploadHandler = async (e) => {
    e.preventDefault();

    const file = fileRef?.current?.files?.[0];
    if (!file) {
      toast.error("CSV file not selected");
      return;
    }

    try {
      setBulkUploading(true);
      const formData = new FormData();
      formData.append("excel", file);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}scrap/bulk-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(result.message);
      setShowBulkUploadMenu(false);
      fetchScrapHandler();

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBulkUploading(false);
    }
  };

  useEffect(() => {
    const searchTxt = searchKey?.toLowerCase();
    const results = data.filter(
      (scrap: any) =>
        scrap.Scrap_name?.toLowerCase()?.includes(searchTxt) ||
        scrap.Scrap_id?.toLowerCase()?.includes(searchTxt) ||
        scrap.price?.toString().toLowerCase().includes(searchTxt) ||
        scrap.Extract_from?.toLowerCase()?.includes(searchTxt) ||
        scrap.Category?.toLowerCase()?.includes(searchTxt) ||
        scrap.qty?.toString().toLowerCase().includes(searchTxt) ||
        scrap.uom?.toLowerCase()?.includes(searchTxt) ||
        scrap.description?.toLowerCase()?.includes(searchTxt) ||
        (scrap?.createdAt &&
          new Date(scrap?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (scrap?.updatedAt &&
          new Date(scrap?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredData(results);
  }, [searchKey, data]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.page }}
    >
      {isAddScrapDrawerOpened && (
        <AddNewScrap
          onScrapCreated={handleScrapCreated}
          closeDrawerHandler={closeAddScrapDrawerHandler}
          editScrap={editScrap}
          onScrapUpdated={handleScrapUpdated}
          fetchScrapsHandler={fetchScrapHandler}
        />
      )}
      <div className="p-2 lg:p-3">
        <div
          className="rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <Recycle className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Scrap Management
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Track and manage production scrap materials
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowBulkUploadMenu(true)}
                className="flex items-center gap-2 px-6 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: colors.warning[600],
                  focusRingColor: colors.warning[500],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.warning[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.warning[600];
                }}
              >
                <AiFillFileExcel size={20} /> Bulk Upload
              </button>
              <button
                onClick={openAddScrapDrawerHandler}
                style={{
                  backgroundColor: colors.primary[600],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                }}
                className="flex items-center gap-2 px-6 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <FiPlus size={16} />
                Add New Scrap
              </button>
              <button
                onClick={fetchScrapHandler}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                style={{
                  borderColor: colors.border.medium,
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.gray[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.background.card;
                }}
              >
                <MdOutlineRefresh size="20px" />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 max-w-md">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Search Scrap Materials
              </label>
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: colors.text.secondary }}
                />
                <input
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      colors.input.borderFocus;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.input.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Search by name, ID, category, extract from..."
                  value={searchKey || ""}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <ScrapTable
            scraps={filteredData}
            isLoadingScraps={isLoadingScraps}
            onEditScrap={handleEditScrap}
            onDeleteScrap={handleDeleteScrap}
            setPage={setPage}
            setLimit={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            Page={page}
            Limit={limit}
            totalRecords={totalRecords}
          />
        </div>
      </div>

      {isAddScrapDrawerOpened && (
        <AddNewScrap
          onScrapCreated={handleScrapCreated}
          closeDrawerHandler={closeAddScrapDrawerHandler}
          fetchScrapsHandler={fetchScrapHandler}
          editScrap={editScrap}
        />
      )}

      {showBulkUploadMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-xl shadow-xl max-w-md w-full p-6"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Bulk Upload Merchants
              </h3>
              <button
                onClick={() => setShowBulkUploadMenu(false)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.gray[100];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <RxCross2 size="20px" />
              </button>
            </div>

            <form onSubmit={bulkUploadHandler}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Choose File (.csv or .xlsx)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv, .xlsx"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={bulkUploading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: colors.button.primary,
                    color: colors.text.inverse,
                  }}
                >
                  {bulkUploading ? "Uploading..." : "Upload"}
                  <AiFillFileExcel size="16px" />
                </button>

                <a href={SampleCSV} className="flex-1">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    Sample CSV
                    <AiFillFileExcel size="16px" />
                  </button>
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scrap;
