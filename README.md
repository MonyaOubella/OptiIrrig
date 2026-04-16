<div align="center">

  # 💧 OptiIrrig: Intelligent Irrigation System
  
  **A Smart, AI-driven IoT Cloud Application for Sustainable Agriculture**

  [![React](https://img.shields.io/badge/React-18.3-blue.svg?style=flat&logo=react)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-1.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![ESP32](https://img.shields.io/badge/ESP32-IoT-red.svg?style=flat&logo=espressif)](https://www.espressif.com/)
  [![MQTT](https://img.shields.io/badge/Protocol-MQTT-purple.svg?style=flat)](#)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](#)
</div>

---

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [System Architecture](#️-system-architecture)
- [Local Development Tutorial](#-local-development-tutorial)
  - [1. Prerequisites](#1-prerequisites)
  - [2. AI API Setup (Backend)](#2-ai-api-setup-backend)
  - [3. IoT Edge Setup (ESP32 Simulation)](#3-iot-edge-setup-esp32-simulation)
  - [4. Web Application Setup (Frontend)](#4-web-application-setup-frontend)
- [The Team](#-the-team)

---

## 🎯 About the Project

**OptiIrrig** is a comprehensive IoT cloud solution built specifically for the Souss Massa region in Morocco to combat water scarcity. It leverages smart sensors, real-time edge processing, seamless MQTT communication, and Machine Learning to optimize water usage in agricultural irrigation.

### The Problem It Solves:
- Farmers lack precise insights on **when** and **how much** to irrigate.
- Water leaks remain **undetected**, causing massive waste of scarce resources.
- Manual intervention is required since remote pump control is inaccessible.

---

## ✨ Key Features

- **📊 Real-Time Interactive Dashboard:** Live telemetry monitoring (humidity, water flow, and pressure).
- **🕹️ Global Pump Control:** Seamlessly open or close irrigation pumps from anywhere in the platform.
- **🚨 Intelligent Leak Alerts:** Real-time detection and precise localization of anomalies.
- **🧠 AI Irrigation Recommendations:** Data-driven logic predicting the optimal irrigation times.
- **📈 Historical Analytics:** Tracking consumption history to build better strategies.
- **👥 Multi-Farm View:** Built for agricultural cooperatives to manage multiple perimeters.

---

## 🏗️ System Architecture

OptiIrrig operates on a 3-tier system:

1. **Edge Node (IoT):** ESP32 virtual simulation written in C++ over PlatformIO/Wokwi, utilizing LoRaWAN/MQTT protocols to mimic hardware sensors (humidity, flow, pressure).
2. **AI & Core Service Engine:** A Python backend equipped with FastAPI and Scikit-learn, capable of rapid predictive inference based on ingested sensor telemetry.
3. **Web Frontend:** A modern React + Vite ecosystem decorated with Shadcn/Radix-UI and TailwindCSS, synchronized globally via React Context over an MQTT state management system.

---

## 🚀 Local Development Tutorial

Ready to run OptiIrrig locally? Follow this step-by-step guide to sequentially run the AI backend, the ESP32 IoT simulation, and the web frontend.

### 1. Prerequisites

Before you begin, ensure you have the following installed on your local machine:
- **[Node.js](https://nodejs.org/en/)** (v18.0+) & npm
- **[Python](https://www.python.org/downloads/)** (3.9+)
- **[Visual Studio Code](https://code.visualstudio.com/)**
- **VS Code Extensions:**
  - `PlatformIO IDE` (for ESP32 runtime)
  - `Wokwi Simulator` (for IoT simulation)

### 2. AI API Setup (Backend)

The Python backend provides the API for AI predictions and is powered by FastAPI.

```bash
# Navigate to the AI directory
cd OptiIrrig-AI

# (Optional but recommended) Create a virtual environment
python -m venv venv
# Activate it:
# Windows: venv\Scripts\activate 
# macOS/Linux: source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt

# Start the FastApi Server
uvicorn model.api:app --reload --host 0.0.0.0 --port 8000
```
> **Note:** The API will be available at `http://localhost:8000`. You can test the endpoints interactively via `http://localhost:8000/docs`.

### 3. IoT Edge Setup (ESP32 Simulation)

The embedded system runs via Wokwi's simulator within VS Code.

1. Open the `edge-node/simulation` directory in VS Code.
2. Allow the **PlatformIO** extension to process the project and install all C++ dependencies specified in `platformio.ini`.
3. Open `diagram.json` containing the visual blueprint of the breadboard.
4. Press **`F1`**, search for **`Wokwi: Start Simulator`**, and execute it. 
5. The simulated ESP32 will boot up, connect to the simulated Wi-Fi network, and start publishing sensor payload metrics to the public/testing MQTT broker.

### 4. Web Application Setup (Frontend)

The frontend is a real-time React application that digests telemetry and controls the water pump. Open a new terminal window for this.

```bash
# Navigate to the project root directory
cd OptiIrrig # (where package.json and vite.config.ts are located)

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
> **Note:** The web frontend will boot up at `http://localhost:5173`. Open this URL in your web browser. 

Once running, the React application will subscribe to the MQTT broker topics, automatically syncing with data flowing in from your Wokwi Simulation instance! 

---

## 👨‍💻 The Team

| Name | Major Discipline | Core Responsibilities |
| :--- | :--- | :--- |
| **Monya OUBELLA** | Software Engineering | Global Architecture, UI/React Prototype, Context State |
| **Soufiane TIDRARINI** | AI & Data Science | Predictive Model, Leak Detection Pipeline |
| **Abdelouahd ID-BOUBRIK** | Embedded Systems | ESP32 Sensor Arrays, LoRaWAN / MQTT Comms |

---
<p align="center">
  <i>Developed with ❤️</i>
</p>
