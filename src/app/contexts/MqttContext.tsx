import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import mqtt from 'mqtt';

interface SensorData {
  pressure: number;
  temperature: number;
  soilMoisture: number;
}

interface MqttContextProps {
  sensorData: SensorData;
  pumpActive: boolean;
  publish: (topic: string, message: string) => void;
  togglePump: (action: "open" | "close") => void;
  connected: boolean;
}

const defaultContext: MqttContextProps = {
  sensorData: { pressure: 0, temperature: 0, soilMoisture: 0 },
  pumpActive: false,
  publish: () => { },
  togglePump: () => { },
  connected: false,
};

const MqttContext = createContext<MqttContextProps>(defaultContext);

export const useMqtt = () => useContext(MqttContext);

export const MqttProvider = ({ children }: { children: ReactNode }) => {
  const [sensorData, setSensorData] = useState<SensorData>({ pressure: 0, temperature: 0, soilMoisture: 0 });
  const [pumpActive, setPumpActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("opti_pump_active");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [connected, setConnected] = useState<boolean>(false);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    localStorage.setItem("opti_pump_active", JSON.stringify(pumpActive));
  }, [pumpActive]);

  useEffect(() => {
    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", {
      keepalive: 60,
      reconnectPeriod: 5000, // Reconnect attempt every 5 seconds
      connectTimeout: 30 * 1000,
    });
    clientRef.current = client;

    client.on("connect", () => {
      setConnected(true);
      client.subscribe("optiirrig/abdel/sensors");
    });

    client.on("reconnect", () => setConnected(false));
    client.on("offline", () => setConnected(false));
    client.on("close", () => setConnected(false));
    client.on("error", (err) => console.error("MQTT Error: ", err));

    client.on("message", (topic, message) => {
      if (topic === "optiirrig/abdel/sensors") {
        try {
          const payload = JSON.parse(message.toString());
          setSensorData({
            pressure: typeof payload.pressure === "number" ? payload.pressure : parseFloat(payload.pressure || 0),
            temperature: typeof payload.temperature === "number" ? payload.temperature : parseFloat(payload.temperature || 0),
            soilMoisture: typeof payload.soil_moisture === "number" ? payload.soil_moisture : parseFloat(payload.soil_moisture || 0),
          });
          if (payload.pump_status) {
            setPumpActive(payload.pump_status === "ON");
          }
        } catch (e) {
          console.error("Failed to parse MQTT message:", e);
        }
      }
    });

    return () => {
      client.end();
    };
  }, []);

  const publish = (topic: string, message: string) => {
    clientRef.current?.publish(topic, message);
  };

  const togglePump = (action: "open" | "close") => {
    if (action === "open") publish("optiirrig/abdel/pump", "PUMP_ON");
    else publish("optiirrig/abdel/pump", "PUMP_OFF");
  };

  return (
    <MqttContext.Provider value={{ sensorData, pumpActive, publish, togglePump, connected }}>
      {children}
    </MqttContext.Provider>
  );
};
