import React, { useEffect, useMemo, useState } from "react";
import { colors } from "../theme/colors";
import { useCookies } from "react-cookie";

type Row = Record<string, any>;

const PlcMachineData: React.FC = () => {
  const [cookies] = useCookies();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(0);

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}machine-telemetry`;

  console.log("API_URL:", API_URL);

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
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }
      const json = await res.json().catch(() => null);
      let incoming: Row[] = [];
      if (Array.isArray(json)) {
        incoming = json as Row[];
      } else if (json && Array.isArray(json?.data)) {
        incoming = json.data as Row[];
      } else if (json && typeof json === "object") {
        // some endpoints wrap object under { data: {...} }
        if (json?.data && typeof json.data === "object" && !Array.isArray(json.data)) {
          incoming = [json.data as Row];
        } else {
          incoming = [json as Row];
        }
      }
      const mapped = incoming.map((item) => {
        const motor = item?.motor || {};
        return {
          machine_id: item?.machine_id,
          timestamp: item?.timestamp,
          temperature_c: item?.temperature_c,
          pressure_bar: item?.pressure_bar,
          motor_status: motor?.status,
          motor_rpm: motor?.rpm,
          light_status: item?.light_status,
          production_count: item?.production_count,
        } as Row;
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
  useEffect(() => {
    if (!refreshIntervalSec) return;
    const id: ReturnType<typeof setInterval> = setInterval(() => {
      fetchData();
    }, refreshIntervalSec * 1000);
    return () => clearInterval(id);
  }, [refreshIntervalSec]);

  const columns = useMemo(
    () => [
      "machine_id",
      "timestamp",
      "temperature_c",
      "pressure_bar",
      "motor_status",
      "motor_rpm",
      "light_status",
      "production_count",
    ],
    []
  );

  const summary = useMemo(() => {
    const totalRecords = rows.length;
    const totalProduction = rows.reduce((sum, r) => sum + (Number(r.production_count) || 0), 0);
    const running = rows.filter((r) => {
      const s = String(r.motor_status || "").toUpperCase();
      return s === "RUNNING" || s === "ON" || s === "START" || s === "TRUE";
    }).length;
    const currentTemperature = Number(rows[0]?.temperature_c) || 0;
    const currentProductionCount = Number(rows[0]?.production_count) || 0;
    const currentLightStatus = rows[0]?.light_status ?? "";
    const avgPressure =
      rows.reduce((sum, r) => sum + (Number(r.pressure_bar) || 0), 0) /
      (totalRecords || 1);
    return {
      totalRecords,
      totalProduction,
      running,
      currentProductionCount,
      currentTemperature,
      currentLightStatus,
      avgPressure,
    };
  }, [rows]);

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
          <select
            value={refreshIntervalSec}
            onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: colors.background.card, color: colors.text.primary, border: `1px solid ${colors.border.light}` }}
          >
            <option value={0}>Auto: Off</option>
            <option value={3}>Auto: 3s</option>
            <option value={5}>Auto: 5s</option>
            <option value={10}>Auto: 10s</option>
          </select>
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg p-4" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.light}` }}>
              <div className="text-sm" style={{ color: colors.text.secondary }}>Light Status</div>
              <div className="text-2xl font-semibold" style={{ color: colors.text.primary }}>{summary.currentLightStatus || "—"}</div>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.light}` }}>
              <div className="text-sm" style={{ color: colors.text.secondary }}>Total Production Count</div>
              <div className="text-2xl font-semibold" style={{ color: colors.text.primary }}>{summary.totalProduction}</div>
            </div>  
            {/* <div className="rounded-lg p-4" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.light}` }}>
              <div className="text-sm" style={{ color: colors.text.secondary }}>Running</div>
              <div className="text-2xl font-semibold" style={{ color: colors.text.primary }}>{summary.running}</div>
            </div> */}
            <div className="rounded-lg p-4" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.light}` }}>
              <div className="text-sm" style={{ color: colors.text.secondary }}>Production Count</div>
              <div className="text-2xl font-semibold" style={{ color: colors.text.primary }}>{summary.currentProductionCount}</div>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.light}` }}>
              <div className="text-sm" style={{ color: colors.text.secondary }}>Temperature (°C)</div>
              <div className="text-2xl font-semibold" style={{ color: colors.text.primary }}>{Number.isFinite(summary.currentTemperature) ? summary.currentTemperature.toFixed(1) : "—"}</div>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.light}` }}>
              <div className="text-sm" style={{ color: colors.text.secondary }}>Avg Pressure (bar)</div>
              <div className="text-2xl font-semibold" style={{ color: colors.text.primary }}>{Number.isFinite(summary.avgPressure) ? summary.avgPressure.toFixed(2) : "—"}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="rounded-xl p-4"
                style={{ backgroundColor: colors.background.card, border: `1px solid ${colors.border.light}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm" style={{ color: colors.text.secondary }}>Machine</div>
                  <div className="text-sm" style={{ color: colors.text.secondary }}>{row.timestamp ? String(row.timestamp) : "—"}</div>
                </div>
                <div className="text-lg font-semibold mb-3" style={{ color: colors.text.primary }}>{row.machine_id || "—"}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm" style={{ color: colors.text.secondary }}>Temperature (°C)</div>
                  <div className="text-sm" style={{ color: colors.text.primary }}>{row.temperature_c ?? "—"}</div>
                  <div className="text-sm" style={{ color: colors.text.secondary }}>Pressure (bar)</div>
                  <div className="text-sm" style={{ color: colors.text.primary }}>{row.pressure_bar ?? "—"}</div>
                  <div className="text-sm" style={{ color: colors.text.secondary }}>Motor Status</div>
                  <div className="text-sm" style={{ color: colors.text.primary }}>{row.motor_status ?? "—"}</div>
                  <div className="text-sm" style={{ color: colors.text.secondary }}>Motor RPM</div>
                  <div className="text-sm" style={{ color: colors.text.primary }}>{row.motor_rpm ?? "—"}</div>
                  <div className="text-sm" style={{ color: colors.text.secondary }}>Light Status</div>
                  <div className="text-sm" style={{ color: colors.text.primary }}>{row.light_status ?? "—"}</div>
                  <div className="text-sm" style={{ color: colors.text.secondary }}>Production Count</div>
                  <div className="text-sm" style={{ color: colors.text.primary }}>{row.production_count ?? "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PlcMachineData;

