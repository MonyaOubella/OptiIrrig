#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// --- Hardware Pins & Setup ---
#define POT_PIN 34       
#define DHT_PIN 4        
#define RELAY_PIN 5      
#define LED_PIN 23       
#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

// --- Network & MQTT Settings ---
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* mqtt_server = "broker.hivemq.com";

// We use unique topics so we don't clash with others on the public broker!
const char* topic_telemetry = "optiirrig/abdel/sensors";
const char* topic_command = "optiirrig/abdel/pump";

WiFiClient espClient;
PubSubClient client(espClient);

// --- Functions ---

void setup_wifi() {
  Serial.print("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Connected!");
}

// This function runs automatically whenever a message arrives from the React Dashboard
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.println(topic);

  // Convert the incoming payload to a readable string
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Dashboard says: ");
  Serial.println(message);

  // Act on the command!
  if (message == "PUMP_ON") {
    digitalWrite(RELAY_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Action: Pump turned ON via Dashboard");
  } else if (message == "PUMP_OFF") {
    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
    Serial.println("Action: Pump turned OFF via Dashboard");
  }
}

// This keeps the MQTT connection alive
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32Client-OptiIrrig-";
    clientId += String(random(0, 0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("Connected to HiveMQ!");
      // Subscribe to the command topic so we can listen to the dashboard
      client.subscribe(topic_command);
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  dht.begin();

  setup_wifi();
  
  // Tell the MQTT client where the broker is and what function to call when a message arrives
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop(); // Keep MQTT process running

  // --- Send Data Every 3 Seconds ---
  static unsigned long lastMsg = 0;
  unsigned long now = millis();
  
  if (now - lastMsg > 3000) {
    lastMsg = now;

    int pressureValue = analogRead(POT_PIN);
    float soilMoisture = dht.readHumidity(); 
    float temperature = dht.readTemperature();

    // Create a JSON document using ArduinoJson
    JsonDocument doc;
    doc["pressure"] = pressureValue;
    doc["temperature"] = temperature;
    doc["soil_moisture"] = soilMoisture;
    
    // Add the current state of the pump to the JSON
    if(digitalRead(RELAY_PIN) == HIGH) {
       doc["pump_status"] = "ON";
    } else {
       doc["pump_status"] = "OFF";
    }

    // Serialize (convert) the JSON object into a string so we can send it
    char jsonBuffer[256];
    serializeJson(doc, jsonBuffer);

    // Publish to the HiveMQ broker
    Serial.print("Publishing Telemetry: ");
    Serial.println(jsonBuffer);
    client.publish(topic_telemetry, jsonBuffer);
  }
}