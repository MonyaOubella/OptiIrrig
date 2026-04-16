import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { useMqtt } from "./MqttContext";

export interface Action {
  id: number;
  action: string;
  time: string;
}

export interface HistoryRecord {
  id: number;
  date: string;
  volume: string;
  duration: string;
  aiFollowed: boolean;
}

export interface ChartDataPoint {
  label: string;
  consumption: number;
}

export interface Alert {
  id: number;
  type: "leak" | "pressure" | "sensor";
  severity: "high" | "medium" | "low";
  message: string;
  location: string;
  time: string;
  resolved: boolean;
}

export interface Farm {
  id: number;
  name: string;
  owner: string;
  location: { x: number; y: number };
  status: "alert" | "normal" | "offline";
  consumption: number;
  alerts: number;
  liveMoisture?: number;
  liveTemperature?: number;
}

interface DataContextProps {
  actions: Action[];
  historyRecords: HistoryRecord[];
  waterConsumptionData: ChartDataPoint[];
  farmsData: Farm[];
  alerts: Alert[];
  pumpStartTime: React.MutableRefObject<number | null>;
  resetSimulation: () => void;
  addAction: (actionText: string) => void;
  resolveAlert: (id: number) => void;
}

const defaultFarms: Farm[] = [
  { id: 1, name: "Exploitation Ben Ahmed", owner: "Ahmed Bennani", location: { x: 20, y: 30 }, status: "normal", consumption: 8500, alerts: 0 },
  { id: 2, name: "Ferme Al-Baraka", owner: "Fatima El Alaoui", location: { x: 60, y: 40 }, status: "normal", consumption: 7200, alerts: 0 },
  { id: 3, name: "Domaine Souss Vert", owner: "Hassan Idrissi", location: { x: 35, y: 60 }, status: "normal", consumption: 9100, alerts: 0 },
  { id: 4, name: "Ferme Massa Agricole", owner: "Karim Bensouda", location: { x: 70, y: 25 }, status: "offline", consumption: 0, alerts: 0 },
  { id: 5, name: "Exploitation Taroudant", owner: "Nadia Alami", location: { x: 45, y: 80 }, status: "normal", consumption: 6800, alerts: 0 },
  { id: 6, name: "Ferme Agadir Bio", owner: "Omar Tazi", location: { x: 80, y: 70 }, status: "alert", consumption: 10200, alerts: 1 },
  { id: 7, name: "Domaine Tiznit", owner: "Zineb Chakir", location: { x: 15, y: 75 }, status: "normal", consumption: 7900, alerts: 0 },
];

const INITIAL_CHART_DATA = [
  { label: "Lun", consumption: 0 },
  { label: "Mar", consumption: 0 },
  { label: "Mer", consumption: 0 },
  { label: "Jeu", consumption: 0 },
  { label: "Ven", consumption: 0 },
  { label: "Sam", consumption: 0 },
  { label: "Dim", consumption: 0 },
];

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.error("Error reading localStorage", e);
  }
  return fallback;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { sensorData, pumpActive } = useMqtt();

  const [actions, setActions] = useState<Action[]>(() => loadLocal("opti_actions", []));
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() => loadLocal("opti_history", []));
  const [waterConsumptionData, setWaterConsumptionData] = useState<ChartDataPoint[]>(() => loadLocal("opti_chart", INITIAL_CHART_DATA));
  const [farmsData, setFarmsData] = useState<Farm[]>(() => loadLocal("opti_farms", defaultFarms));
  const [alerts, setAlerts] = useState<Alert[]>(() => loadLocal("opti_alerts", []));

  const pumpStartTime = useRef<number | null>(loadLocal("opti_pump_start", null));
  const prevPumpState = useRef<boolean>(pumpActive);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("opti_alerts", JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem("opti_actions", JSON.stringify(actions));
  }, [actions]);

  useEffect(() => {
    localStorage.setItem("opti_history", JSON.stringify(historyRecords));
  }, [historyRecords]);

  useEffect(() => {
    localStorage.setItem("opti_chart", JSON.stringify(waterConsumptionData));
  }, [waterConsumptionData]);

  useEffect(() => {
    localStorage.setItem("opti_farms", JSON.stringify(farmsData));
  }, [farmsData]);

  const addAction = (actionText: string) => {
    setActions((prev) => {
      const updated = [
        {
          id: Date.now(),
          action: actionText,
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        },
        ...prev,
      ];
      return updated.slice(0, 100); // Failsafe memory constraint
    });
  };

  const addConsumption = (liters: number) => {
    setWaterConsumptionData((prev) => {
      const updated = [...prev];
      const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon, 6=Sun
      updated[todayIndex].consumption += liters;
      return updated;
    });
  };

  // Pump Action Lifecycle
  useEffect(() => {
    if (pumpActive && !prevPumpState.current) {
      // Pump Turned ON
      pumpStartTime.current = Date.now();
      localStorage.setItem("opti_pump_start", JSON.stringify(pumpStartTime.current));
      addAction("Pompe ouverte automatiquement/manuellement");
    } else if (!pumpActive && prevPumpState.current) {
      // Pump Turned OFF
      const start = pumpStartTime.current || Date.now();
      const end = Date.now();
      const durationMin = (end - start) / 60000;
      const consumedLiters = Math.max(1, Math.round(durationMin * 10)); // 1 min = 10L formula
      
      addAction("Pompe fermée. " + consumedLiters + "L consommés");

      // Add to history
      setHistoryRecords((prev) => {
        const updated = [
          {
            id: Date.now(),
            date: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
            volume: `${consumedLiters} L`,
            duration: `${Math.round(durationMin * 60)} sec`,
            aiFollowed: true, // Assuming true for simulation
          },
          ...prev,
        ];
        return updated.slice(0, 100); // Failsafe memory constraint
      });

      // Update Chart Data
      addConsumption(consumedLiters);

      // Update Farm 1 Consumption Total
      setFarmsData(prev => prev.map(farm => {
        if (farm.id === 1) {
          return { ...farm, consumption: farm.consumption + consumedLiters };
        }
        return farm;
      }));

      pumpStartTime.current = null;
      localStorage.removeItem("opti_pump_start");
    }
    prevPumpState.current = pumpActive;
  }, [pumpActive]);

  // Live "Ben Ahmed" Farm binding
  useEffect(() => {
    setFarmsData(prev => prev.map(farm => {
      if (farm.id === 1) {
        const isDry = sensorData.soilMoisture < 40;
        return {
          ...farm,
          status: isDry ? "alert" : "normal",
          liveMoisture: sensorData.soilMoisture,
          liveTemperature: sensorData.temperature,
          alerts: isDry ? 1 : 0
        };
      }
      return farm;
    }));
  }, [sensorData.soilMoisture, sensorData.temperature]);

  // Anti-Spam Alerts Logic
  useEffect(() => {
    if (sensorData.soilMoisture < 30) {
      setAlerts((prev) => {
        // Anti-Spam check: ensure no unresolved "sensor" alert exists for Ben Ahmed
        const existingUnresolved = prev.some((a) => !a.resolved && a.type === "sensor" && a.location.includes("Ben Ahmed"));
        if (existingUnresolved) return prev;

        const newAlert: Alert = {
          id: Date.now(),
          type: "sensor",
          severity: "high",
          message: "Humidité critique (< 30%) du sol",
          location: "Exploitation Ben Ahmed (Secteur A)",
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          resolved: false,
        };
        return [newAlert, ...prev].slice(0, 100);
      });
    } else {
      // Automatiquement retirer l'alerte si l'humidité remonte
      setAlerts((prev) => prev.map(a => 
        (a.type === "sensor" && !a.resolved && a.location.includes("Ben Ahmed")) 
          ? { ...a, resolved: true } 
          : a
      ));
    }
    
    // Simulate extra-ordinary anomaly optionally
    if (sensorData.pressure > 5) {
      setAlerts((prev) => {
        const existingUnresolved = prev.some((a) => !a.resolved && a.type === "pressure");
        if (existingUnresolved) return prev;

        const newAlert: Alert = {
          id: Date.now(),
          type: "pressure",
          severity: "high",
          message: "Pression anormalement élevée (Surpression)",
          location: "Pompe principale",
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          resolved: false,
        };
        return [newAlert, ...prev].slice(0, 100);
      });
    } else {
      // Automatiquement retirer l'alerte de surpression
      setAlerts((prev) => prev.map(a => 
        (a.type === "pressure" && !a.resolved) 
          ? { ...a, resolved: true } 
          : a
      ));
    }
  }, [sensorData.soilMoisture, sensorData.pressure]);

  // Offline Farms Simulated Telemetry
  useEffect(() => {
    const simInterval = setInterval(() => {
      setFarmsData(prev => prev.map(farm => {
        // Farm 1 is strictly MQTT. Farm 4 is offline.
        if (farm.id === 1 || farm.id === 4) return farm;

        const baseMoisture = farm.id % 2 === 0 ? 55 : 35; // some dry, some wet
        const baseTemp = 24 + farm.id;
        
        // Random fluctuation +/- 3
        const fluctuate = () => (Math.random() * 6 - 3);

        const newMoisture = Math.max(0, Math.min(100, baseMoisture + fluctuate()));
        const newTemp = Math.max(0, Math.min(50, baseTemp + fluctuate()));
        const isDry = newMoisture < 40;

        return {
          ...farm,
          status: isDry ? "alert" : "normal",
          liveMoisture: newMoisture,
          liveTemperature: newTemp,
          alerts: isDry ? 1 : 0
        };
      }));
    }, 4000); // Update every 4 seconds

    return () => clearInterval(simInterval);
  }, []);

  const resetSimulation = () => {
    localStorage.clear();
    setActions([]);
    setHistoryRecords([]);
    setWaterConsumptionData(INITIAL_CHART_DATA);
    setFarmsData(defaultFarms);
    setAlerts([]);
    pumpStartTime.current = null;
  };

  const resolveAlert = (id: number) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  };

  return (
    <DataContext.Provider value={{ actions, historyRecords, waterConsumptionData, farmsData, alerts, pumpStartTime, resetSimulation, addAction, resolveAlert }}>
      {children}
    </DataContext.Provider>
  );
};
