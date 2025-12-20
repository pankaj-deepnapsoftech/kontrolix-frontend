import { useEffect, useRef, useState, useCallback } from "react";
import { useCookies } from 'react-cookie';
import { motion } from "framer-motion";
import io, { Socket } from 'socket.io-client'; // CHANGE 1: Imported socket.io-client for real-time communication

const Sensors: React.FC = () => {
  // Backend base URL from env (CRA), fallback to localhost
  const BACKEND_BASE_URL = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:9023/api/') as string;
  const BASE_URL = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL : `${BACKEND_BASE_URL}/`;
  const DEVICE_GET_URL = `${BASE_URL}devicedata/get-device-data`;
  const DEVICE_POST_URL = `${BASE_URL}devicedata/dashboardtodb`;
  const [cookies] = useCookies();
  // Real-time Sensor Data
  const [temperature, setTemperature] = useState<number>(30.2);
  const [humidity, setHumidity] = useState<number>(42);
  const [gasLevel, setGasLevel] = useState<number>(148);
  const [breakCount, setBreakCount] = useState<number>(1);
  const [motorRPM, setMotorRPM] = useState<number>(0);
  const [encoderCount, setEncoderCount] = useState<number>(0);
  // LDR raw is tracked only for edge counting now
  const [ldrOneCount, setLdrOneCount] = useState<number>(0);
  const [encoderA, setEncoderA] = useState<number>(1);
  const [encoderB, setEncoderB] = useState<number>(1);
  // Track how many times encoder signals become 1 (rising edge counts)
  const encoderAOneCountRef = useRef<number>(0);
  const encoderBOneCountRef = useRef<number>(0);
  const prevEncoderARef = useRef<number>(1);
  const prevEncoderBRef = useRef<number>(1);
  const prevLdrRef = useRef<number>(0);
  
  // Device States
  const [lightState, setLightState] = useState<boolean>(false);
  const [fanState, setFanState] = useState<boolean>(false);
  const [motorState, setMotorState] = useState<boolean>(false);
  const [rgbState, setRgbState] = useState<boolean>(false);
  
  // RGB Color Values
  const [rgbRed, setRgbRed] = useState<number>(255);
  const [rgbGreen, setRgbGreen] = useState<number>(255);
  const [rgbBlue, setRgbBlue] = useState<number>(255);
  
  // Sensor History for Bar Charts
  const [temperatureHistory, setTemperatureHistory] = useState<number[]>([30.2, 30.1, 30.3, 30.0]);
  const [humidityHistory, setHumidityHistory] = useState<number[]>([42, 41, 43, 40]);
  // Separate ON/OFF counters for each device
  const [lightOnCount, setLightOnCount] = useState<number>(0);
  const [lightOffCount, setLightOffCount] = useState<number>(0);
  const [fanOnCount, setFanOnCount] = useState<number>(0);
  const [fanOffCount, setFanOffCount] = useState<number>(0);
  const [motorOnCount, setMotorOnCount] = useState<number>(0);
  const [motorOffCount, setMotorOffCount] = useState<number>(0);
  const [rgbOnCount, setRgbOnCount] = useState<number>(0);
  const [rgbOffCount, setRgbOffCount] = useState<number>(0);

  // CHANGE 2: Added socketRef to hold the Socket.IO client instance
  const socketRef = useRef<Socket | null>(null);

  // CHANGE: Moved fetchFromBackend out of the useEffect and wrapped it in useCallback so it can be called from the socket listener and on mount. Dependencies ensure it uses latest values.
  const fetchFromBackend = useCallback(async () => {
    try {
      const res = await fetch(DEVICE_GET_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies?.access_token || ''}`
        },
        credentials: 'include'
      });
      if (!res.ok) return;
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];
      if (!data.length) return;

      const latest = data[0];
      setTemperature(typeof latest.temperature === 'number' ? latest.temperature : 0);
      setHumidity(typeof latest.humidity === 'number' ? latest.humidity : 0);
      setGasLevel(typeof latest.gasLevel === 'number' ? latest.gasLevel : 0);
      setBreakCount(typeof latest.breakCount === 'number' ? latest.breakCount : 0);
      setMotorRPM(typeof latest.motorRPM === 'number' ? latest.motorRPM : 0);
      setEncoderCount(typeof latest.encoderCount === 'number' ? latest.encoderCount : 0);
      setLightState(Boolean(latest.lightState));
      setFanState(Boolean(latest.fanState));
      setMotorState(Boolean(latest.motorState));
      setRgbState(Boolean(latest.rgbState));
      setRgbRed(typeof latest.rgbRed === 'number' ? latest.rgbRed : 255);
      setRgbGreen(typeof latest.rgbGreen === 'number' ? latest.rgbGreen : 255);
      setRgbBlue(typeof latest.rgbBlue === 'number' ? latest.rgbBlue : 255);
      if (typeof latest.ldrRaw === 'number') {
        if (prevLdrRef.current !== 1 && latest.ldrRaw === 1) {
          setLdrOneCount((c) => c + 1);
        }
        prevLdrRef.current = latest.ldrRaw;
      }
      if (typeof latest.encoderA === 'number') {
        if (prevEncoderARef.current !== 1 && latest.encoderA === 1) {
          encoderAOneCountRef.current = encoderAOneCountRef.current + 1;
        }
        prevEncoderARef.current = latest.encoderA;
        setEncoderA(latest.encoderA);
      }
      if (typeof latest.encoderB === 'number') {
        if (prevEncoderBRef.current !== 1 && latest.encoderB === 1) {
          encoderBOneCountRef.current = encoderBOneCountRef.current + 1;
        }
        prevEncoderBRef.current = latest.encoderB;
        setEncoderB(latest.encoderB);
      }

      // Update history for bar charts (last 4 readings)
      setTemperatureHistory(prev => {
        const newHistory = [latest.temperature || 0, ...prev].slice(0, 4);
        return newHistory;
      });
      setHumidityHistory(prev => {
        const newHistory = [latest.humidity || 0, ...prev].slice(0, 4);
        return newHistory;
      });
    } catch (e) {
      // Silently ignore to keep UI responsive
    }
  }, [DEVICE_GET_URL, cookies?.access_token]);

  // CHANGE: Added useEffect to call fetchFromBackend on mount (initial fetch).
  useEffect(() => {
    fetchFromBackend();
  }, [fetchFromBackend]);

    // Add setInterval to fetch data every 3 seconds
  /* useEffect(() => {
    const interval = setInterval(() => {
      fetchFromBackend();
    }, 3000); // 3 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchFromBackend]); */

  // CHANGE 3: Added useEffect to initialize Socket.IO, join dashboard room, and listen for updates
  useEffect(() => {
    // Initialize Socket.IO client
    const socketUrl =
      (process.env.REACT_APP_SOCKET_URL || (process.env.REACT_APP_BACKEND_URL || '')
        .replace(/\/api\/?$/, '')) || 'http://localhost:9023';
    socketRef.current = io(socketUrl, {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${cookies?.access_token || ''}`,
      },
    });
    
    // Join the 'dashboard' room
    socketRef.current.emit('joinDashboard');

    // Handle sensor data updates from NodeMCU
    socketRef.current.on('controlDataUpdate', (data: {
      lightState?: boolean;
      fanState?: boolean;
      motorState?: boolean;
      rgbState?: boolean;
      breakCount?: number;
      rgbRed?: number;
      rgbGreen?: number;
      rgbBlue?: number;
      temperature?: number;
      humidity?: number;
      gasLevel?: number;
      ldrRaw?: number;
      encoderCount?: number;
      encoderA?: number;
      encoderB?: number;
      motorRPM?: number;
    }) => {
      // Check if this is sensor data update (contains temperature, humidity, etc.)
      if ('temperature' in data || 'humidity' in data || 'gasLevel' in data) {
        // Update sensor data directly from socket
        if (typeof data.temperature === 'number') setTemperature(data.temperature);
        if (typeof data.humidity === 'number') setHumidity(data.humidity);
        if (typeof data.gasLevel === 'number') setGasLevel(data.gasLevel);
        if (typeof data.motorRPM === 'number') setMotorRPM(data.motorRPM);
        if (typeof data.encoderCount === 'number') setEncoderCount(data.encoderCount);
        if (typeof data.breakCount === 'number') setBreakCount(data.breakCount);
        
        // Handle LDR edge counting
        if (typeof data.ldrRaw === 'number') {
          if (prevLdrRef.current !== 1 && data.ldrRaw === 1) {
            setLdrOneCount((c) => c + 1);
          }
          prevLdrRef.current = data.ldrRaw;
        }
        
        // Handle encoder edge counting
        if (typeof data.encoderA === 'number') {
          if (prevEncoderARef.current !== 1 && data.encoderA === 1) {
            encoderAOneCountRef.current = encoderAOneCountRef.current + 1;
          }
          prevEncoderARef.current = data.encoderA;
          setEncoderA(data.encoderA);
        }
        
        if (typeof data.encoderB === 'number') {
          if (prevEncoderBRef.current !== 1 && data.encoderB === 1) {
            encoderBOneCountRef.current = encoderBOneCountRef.current + 1;
          }
          prevEncoderBRef.current = data.encoderB;
          setEncoderB(data.encoderB);
        }

        // Update history for bar charts
        if (typeof data.temperature === 'number') {
          const tempValue = data.temperature;
          setTemperatureHistory(prev => {
            const newHistory = [tempValue, ...prev].slice(0, 4);
            return newHistory;
          });
        }
        if (typeof data.humidity === 'number') {
          const humidityValue = data.humidity;
          setHumidityHistory(prev => {
            const newHistory = [humidityValue, ...prev].slice(0, 4);
            return newHistory;
          });
        }
      } else {
        // Update control states if present (for control updates)
        if (typeof data.lightState === 'boolean') setLightState(data.lightState);
        if (typeof data.fanState === 'boolean') setFanState(data.fanState);
        if (typeof data.motorState === 'boolean') setMotorState(data.motorState);
        if (typeof data.rgbState === 'boolean') setRgbState(data.rgbState);
        if (typeof data.breakCount === 'number') setBreakCount(data.breakCount);
        if (typeof data.rgbRed === 'number') setRgbRed(data.rgbRed);
        if (typeof data.rgbGreen === 'number') setRgbGreen(data.rgbGreen);
        if (typeof data.rgbBlue === 'number') setRgbBlue(data.rgbBlue);
      }
    });

    // Cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [cookies?.access_token]); // Removed fetchFromBackend dependency to prevent infinite re-renders

  // Persist Usage counts in localStorage
  useEffect(() => {
    try {
      const ls = (key: string) => Number(localStorage.getItem(key) || '0') || 0;
      setLightOnCount(ls('sensors_light_on_count'));
      setLightOffCount(ls('sensors_light_off_count'));
      setFanOnCount(ls('sensors_fan_on_count'));
      setFanOffCount(ls('sensors_fan_off_count'));
      setMotorOnCount(ls('sensors_motor_on_count'));
      setMotorOffCount(ls('sensors_motor_off_count'));
      setRgbOnCount(ls('sensors_rgb_on_count'));
      setRgbOffCount(ls('sensors_rgb_off_count'));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sensors_light_on_count', String(lightOnCount));
      localStorage.setItem('sensors_light_off_count', String(lightOffCount));
      localStorage.setItem('sensors_fan_on_count', String(fanOnCount));
      localStorage.setItem('sensors_fan_off_count', String(fanOffCount));
      localStorage.setItem('sensors_motor_on_count', String(motorOnCount));
      localStorage.setItem('sensors_motor_off_count', String(motorOffCount));
      localStorage.setItem('sensors_rgb_on_count', String(rgbOnCount));
      localStorage.setItem('sensors_rgb_off_count', String(rgbOffCount));
    } catch {}
  }, [lightOnCount, lightOffCount, fanOnCount, fanOffCount, motorOnCount, motorOffCount, rgbOnCount, rgbOffCount]);

  // CHANGE 4: Modified postControls to send only the changed fields
  const postControls = async (controls: {
    lightState?: boolean;
    fanState?: boolean;
    motorState?: boolean;
    rgbState?: boolean;
    breakCount?: number;
    rgbRed?: number;
    rgbGreen?: number;
    rgbBlue?: number;
  }) => {
    try {
      const response = await fetch(DEVICE_POST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies?.access_token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify(controls), // Only send the changed fields
      });
      if (!response.ok) throw new Error('Failed to send control data');
    } catch (err) {
      alert('Failed to update device controls. Please try again.');
    }
  };

  // Local log for control commands
  const sendControlCommand = (device: string, state: boolean) => {
    
  };

  // Contrast color for RGB shortcut icon
  const rgbShortcutIconClass = ((0.299 * rgbRed + 0.587 * rgbGreen + 0.114 * rgbBlue) > 153)
    ? 'text-black'
    : 'text-white';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">IoT Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="text-gray-600">LIVE DATA</span>
        </div>
      </motion.div>

      {/* Temperature and Humidity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Temperature Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Temperature</h3>
            <div className="text-4xl font-bold text-gray-800 mb-4">
              {temperature.toFixed(1)} °C
            </div>
            <div className="flex items-end justify-center gap-2 h-16">
              {temperatureHistory.map((value, index) => (
                <div
                  key={index}
                  className="bg-blue-400 rounded-t-lg"
                  style={{ width: '20px', height: `${(value / 50) * 100}%` }}
                ></div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Humidity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Humidity</h3>
            <div className="text-4xl font-bold text-gray-800 mb-4">
              {humidity.toFixed(0)} %
            </div>
            <div className="flex items-end justify-center gap-2 h-16">
              {humidityHistory.map((value, index) => (
                <div
                  key={index}
                  className="bg-blue-400 rounded-t-lg"
                  style={{ width: '20px', height: `${(value / 100) * 100}%` }}
                ></div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Sensor Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Gas Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Gas Level</h3>
            <div className="text-4xl font-bold text-gray-800 mb-4">
              {gasLevel}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (gasLevel / 300) * 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* LDR Raw */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Assembly Line</h3>
            <div className="text-4xl font-bold text-gray-800">{breakCount}</div>
            <div className="text-sm text-gray-500 mt-2"> </div>
          </div>
        </motion.div>

        {/* Motor RPM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Motor RPM</h3>
            <div className="text-4xl font-bold text-gray-800 mb-4">
              {motorRPM}
            </div>
            <div className="text-sm text-gray-500">Encoder Count: {encoderCount}</div>
            {/* <div className="text-sm text-gray-500 mt-2">LDR Raw: {ldrRaw}</div> */}
            <div className="text-sm text-gray-500">Encoder A: {encoderA}, B: {encoderB}</div>
          </div>
        </motion.div>
      </div>

      {/* Device Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Lights */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5 }}
          className={`relative rounded-2xl p-5 shadow-lg ring-1 ${
            lightState ? 'bg-indigo-600 ring-indigo-500/40 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.7)]' : 'bg-gradient-to-br from-blue-50 to-blue-200 ring-indigo-100 shadow-indigo-200'
          } hover:translate-y-[-2px] transition-transform`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-semibold tracking-wide ${lightState ? 'text-white' : 'text-indigo-700'}`}>Lights</span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${lightState ? 'bg-white/20 text-white' : 'bg-white text-indigo-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${lightState ? 'bg-emerald-300' : 'bg-slate-400'}`} />
              {lightState ? 'On' : 'Off'}
              </span>
          </div>
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              lightState ? 'bg-white/20' : 'bg-indigo-600'
            }`}>
              <svg className={`w-6 h-6 text-white`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 10-2 0V3a3 3 0 116 0v1a1 1 0 10-2 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
              </svg>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xs uppercase tracking-wider ${lightState ? 'text-white/80' : 'text-indigo-700/80'}`}>Usage</span>
              <span className={`text-[12px] font-medium ${lightState ? 'text-white' : 'text-indigo-800'}`}>On - {lightOnCount}  Off - {lightOffCount} times</span>
            </div>
          </div>
        </motion.div>

        {/* Fan */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.6 }}
          className={`relative rounded-2xl p-5 shadow-lg ring-1 ${
            fanState ? 'bg-indigo-600 ring-indigo-500/40 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.7)]' : 'bg-gradient-to-br from-blue-50 to-blue-200 ring-indigo-100 shadow-indigo-200'
          } hover:translate-y-[-2px] transition-transform`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-semibold tracking-wide ${fanState ? 'text-white' : 'text-indigo-700'}`}>Fan</span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${fanState ? 'bg-white/20 text-white' : 'bg-white text-indigo-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${fanState ? 'bg-emerald-300' : 'bg-slate-400'}`} />
              {fanState ? 'On' : 'Off'}
              </span>
          </div>
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              fanState ? 'bg-white/20' : 'bg-indigo-600'
            }`}>
              <svg className={`w-6 h-6 text-white`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xs uppercase tracking-wider ${fanState ? 'text-white/80' : 'text-indigo-700/80'}`}>Usage</span>
              <span className={`text-[12px] font-medium ${fanState ? 'text-white' : 'text-indigo-800'}`}>On - {fanOnCount}  Off - {fanOffCount} times</span>
            </div>
          </div>
        </motion.div>

        {/* Motor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.7 }}
          className={`relative rounded-2xl p-5 shadow-lg ring-1 ${
            motorState ? 'bg-indigo-600 ring-indigo-500/40 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.7)]' : 'bg-gradient-to-br from-blue-50 to-blue-200 ring-indigo-100 shadow-indigo-200'
          } hover:translate-y-[-2px] transition-transform`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-semibold tracking-wide ${motorState ? 'text-white' : 'text-indigo-700'}`}>Motor</span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${motorState ? 'bg-white/20 text-white' : 'bg-white text-indigo-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${motorState ? 'bg-emerald-300' : 'bg-slate-400'}`} />
              {motorState ? 'On' : 'Off'}
              </span>
          </div>
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              motorState ? 'bg-white/20' : 'bg-indigo-600'
            }`}>
              <svg className={`w-6 h-6 text-white`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xs uppercase tracking-wider ${motorState ? 'text-white/80' : 'text-indigo-700/80'}`}>Usage</span>
              <span className={`text-[12px] font-medium ${motorState ? 'text-white' : 'text-indigo-800'}`}>On - {motorOnCount} / Off - {motorOffCount} times</span>
            </div>
          </div>
        </motion.div>

        {/* RGB LED */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.8 }}
          className={`relative rounded-2xl p-5 shadow-lg ring-1 ${
            rgbState ? 'bg-indigo-600 ring-indigo-500/40 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.7)]' : 'bg-gradient-to-br from-blue-50 to-blue-200 ring-indigo-100 shadow-indigo-200'
          } hover:translate-y-[-2px] transition-transform`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-semibold tracking-wide ${rgbState ? 'text-white' : 'text-indigo-700'}`}>RGB LED</span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${rgbState ? 'bg-white/20 text-white' : 'bg-white text-indigo-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${rgbState ? 'bg-emerald-300' : 'bg-slate-400'}`} />
              {rgbState ? 'On' : 'Off'}
              </span>
          </div>
          <div className="flex items-center justify-between">
            <div 
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                rgbState ? 'bg-white/20' : 'bg-indigo-600'
              }`}
              style={rgbState ? { backgroundColor: `rgb(${rgbRed}, ${rgbGreen}, ${rgbBlue})` } : {}}
            >
              <svg className={`w-6 h-6 ${rgbState ? rgbShortcutIconClass : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xs uppercase tracking-wider ${rgbState ? 'text-white/80' : 'text-indigo-700/80'}`}>Usage</span>
              <span className={`text-[12px] font-medium ${rgbState ? 'text-white' : 'text-indigo-800'}`}>On - {rgbOnCount}   Off - {rgbOffCount} times</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RGB Color Controls */}
      {rgbState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `rgb(${rgbRed}, ${rgbGreen}, ${rgbBlue})` }}
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">RGB Color Control</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Red Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Red</span>
                <span className="text-sm text-gray-500">{rgbRed}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgbRed}
                  onChange={(e) => { const v = parseInt(e.target.value); setRgbRed(v); postControls({ rgbRed: v }); }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-red"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(rgbRed / 255) * 100}%, #e5e7eb ${(rgbRed / 255) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            </div>

            {/* Green Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Green</span>
                <span className="text-sm text-gray-500">{rgbGreen}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgbGreen}
                  onChange={(e) => { const v = parseInt(e.target.value); setRgbGreen(v); postControls({ rgbGreen: v }); }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(rgbGreen / 255) * 100}%, #e5e7eb ${(rgbGreen / 255) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            </div>

            {/* Blue Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Blue</span>
                <span className="text-sm text-gray-500">{rgbBlue}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgbBlue}
                  onChange={(e) => { const v = parseInt(e.target.value); setRgbBlue(v); postControls({ rgbBlue: v }); }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(rgbBlue / 255) * 100}%, #e5e7eb ${(rgbBlue / 255) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Shortcuts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Shortcuts</h3>
        </div>

        <div className="space-y-4">
          {/* Lights */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 10-2 0V3a3 3 0 116 0v1a1 1 0 10-2 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Lights</span>
            </div>
            <button
              onClick={() => {
                const newState = !lightState;
                setLightState(newState);
                sendControlCommand('light', newState);
                postControls({ lightState: newState });
                if (newState) setLightOnCount((c) => c + 1); else setLightOffCount((c) => c + 1);
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                lightState ? 'bg-green-400' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                lightState ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          {/* Fan */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center"> 
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Fan</span>
            </div>
            <button
              onClick={() => {
                const newState = !fanState;
                setFanState(newState);
                sendControlCommand('fan', newState);
                postControls({ fanState: newState });
                if (newState) setFanOnCount((c) => c + 1); else setFanOffCount((c) => c + 1);
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                fanState ? 'bg-green-400' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                fanState ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          {/* Motor */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-800">Motor</span>
            </div>
            <button
              onClick={() => {
                const newState = !motorState;
                setMotorState(newState);
                sendControlCommand('motor', newState);
                postControls({ motorState: newState });
                if (newState) setMotorOnCount((c) => c + 1); else setMotorOffCount((c) => c + 1);
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                motorState ? 'bg-green-400' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                motorState ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          {/* RGB LED */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `rgb(${rgbRed}, ${rgbGreen}, ${rgbBlue})` }}
              >
                <svg className={`w-6 h-6 ${rgbShortcutIconClass}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-800">RGB LED</span>
                <div className="text-xs text-gray-500">RGB({rgbRed}, {rgbGreen}, {rgbBlue})</div>
              </div>
            </div>
            <button
              onClick={() => {
                const newState = !rgbState;
                setRgbState(newState);
                sendControlCommand('rgb', newState);
                postControls({ rgbState: newState });
                if (newState) setRgbOnCount((c) => c + 1); else setRgbOffCount((c) => c + 1);
              }}
              className={`w-12 h-6 rounded-full transition-colors ${
                rgbState ? 'bg-green-400' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                rgbState ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Sensors;           