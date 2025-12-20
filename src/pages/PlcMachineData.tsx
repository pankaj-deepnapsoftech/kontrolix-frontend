import React, { useEffect, useMemo, useState } from "react";
import { colors } from "../theme/colors";
import { useCookies } from "react-cookie";

type Row = Record<string, any>;

const PlcMachineData: React.FC = () => {
  const [cookies] = useCookies();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const API_URL = "https://mindaapi.itsybizz.com/api/dashboard/plc-machine-data";

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: cookies?.access_token ? `Bearer ${cookies.access_token}` : "",
        },
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      let incoming: Row[] = [];
      if (Array.isArray(json)) {
        incoming = json as Row[];
      } else if (json && Array.isArray(json?.data)) {
        incoming = json.data as Row[];
      } else if (json && typeof json === "object") {
        incoming = [json as Row];
      }
      const mapped = incoming.map((item) => {
        const base: Row = {
          device_id: item?.device_id,
          timestamp: item?.timestamp,
        };
        const dm = item?.dm_words || {};
        for (const k of [
          "DM0000",
          "DM0001",
          "DM0002",
          "DM0003",
          "DM0004",
          "DM0005",
          "DM0006",
          "DM0007",
          "DM0008",
          "DM0009",
        ]) {
          base[k] = dm?.[k];
        }
        return base;
      });
      setRows(mapped);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch PLC machine data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      "device_id",
      "timestamp",
      "DM0000",
      "DM0001",
      "DM0002",
      "DM0003",
      "DM0004",
      "DM0005",
      "DM0006",
      "DM0007",
      "DM0008",
      "DM0009",
    ],
    []
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
            PLC Machine Data
          </h1>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            GET {API_URL}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: colors.button.primary }}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary[500] }} />
            <span className="font-medium" style={{ color: colors.text.secondary }}>Loading...</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: colors.error[50], color: colors.error[700], border: `1px solid ${colors.error[200]}` }}>
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text.primary }}>No data</h3>
          <p className="text-sm" style={{ color: colors.text.secondary }}>API returned empty result</p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div
          className="rounded-xl shadow-sm overflow-hidden"
          style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.light}` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: colors.table.header }}>
                <tr style={{ borderBottom: `1px solid ${colors.table.border}` }}>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
                      style={{ color: colors.table.headerText }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="transition-colors"
                    style={{
                      backgroundColor: idx % 2 === 0 ? colors.background.card : colors.table.stripe,
                      borderBottom: `1px solid ${colors.table.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.table.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = idx % 2 === 0 ? colors.background.card : colors.table.stripe;
                    }}
                  >
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: colors.text.secondary }}>
                        {row[col] === null || row[col] === undefined ? "—" : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlcMachineData;

