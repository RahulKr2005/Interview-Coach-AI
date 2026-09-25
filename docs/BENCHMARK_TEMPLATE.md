# Hardware & Inference Benchmark Template

Use this unpopulated benchmark template to record real, reproducible performance metrics on your local machine or target Snapdragon-powered HP PC.

> **Note on Integrity**: No benchmark numbers or efficiency claims are fabricated. All metric entries are unpopulated templates to be measured by hardware testers using Windows Performance Monitor, battery diagnostics, or inference runtime logs.

---

## 1. Test Environment Specification

| Parameter | Test Machine Specification | Target Snapdragon PC Specification |
| :--- | :--- | :--- |
| **Device Model** | [e.g., HP OmniBook X 14 / HP EliteBook Ultra] | |
| **Processor / SoC** | [e.g., Snapdragon X Elite X1E-78-100, 12 cores] | |
| **NPU TOPS** | [e.g., Qualcomm Hexagon NPU 45 TOPS] | |
| **Total System RAM** | [e.g., 16 GB or 32 GB LPDDR5X] | |
| **Operating System** | [e.g., Windows 11 Home/Pro ARM64 Build 26100] | |
| **Power State** | [AC Mains Connected / Battery at 80%] | |

---

## 2. Model & Runtime Configuration

| Parameter | Configuration |
| :--- | :--- |
| **Inference Runtime** | [Ollama / LM Studio / llama.cpp / ONNX Runtime GenAI] |
| **Execution Provider / Device** | [CPU / Adreno GPU / Qualcomm QNN NPU] |
| **Model Name** | [e.g., Llama-3-8B-Instruct, Phi-3-Mini] |
| **Quantization Precision** | [e.g., INT4, Q4_K_M, INT8, FP16] |
| **Context Window Size** | [e.g., 2048 or 4096 tokens] |
| **Prompt Size (Average)** | [~350 tokens (question, rubric, candidate response)] |
| **Max Output Tokens** | [800 tokens] |

---

## 3. Latency & Throughput Benchmark

*Execute 5 consecutive evaluation calls for a 5-question mock session and record the values below:*

| Run # | Time to First Token (TTFT) (ms) | Total Evaluation Time (s) | Output Token Count | Generation Throughput (tokens/s) |
| :--- | :--- | :--- | :--- | :--- |
| Run 1 | *[untested]* | *[untested]* | *[untested]* | *[untested]* |
| Run 2 | *[untested]* | *[untested]* | *[untested]* | *[untested]* |
| Run 3 | *[untested]* | *[untested]* | *[untested]* | *[untested]* |
| Run 4 | *[untested]* | *[untested]* | *[untested]* | *[untested]* |
| Run 5 | *[untested]* | *[untested]* | *[untested]* | *[untested]* |
| **Average** | **[untested]** | **[untested]** | **[untested]** | **[untested]** |

---

## 4. Resource Utilization & Memory Footprint

*Measure using Windows Task Manager / Performance Monitor:*

| Metric | Idle State | Active PDF Extraction | Active AI Inference |
| :--- | :--- | :--- | :--- |
| **Backend Python Memory (MB)** | *[untested]* | *[untested]* | *[untested]* |
| **Frontend Node/Browser Memory (MB)** | *[untested]* | *[untested]* | *[untested]* |
| **Inference Server RAM Usage (GB)** | *[untested]* | *[untested]* | *[untested]* |
| **Peak System RAM %** | *[untested]* | *[untested]* | *[untested]* |
| **CPU Utilization %** | *[untested]* | *[untested]* | *[untested]* |
| **NPU Utilization %** *(if QNN active)* | *[untested]* | *[untested]* | *[untested]* |

---

## 5. Battery & Thermal Impact (Portable Mode)

*Test over a full 15-question mock interview session on battery power:*

| Metric | Measurement |
| :--- | :--- |
| **Initial Battery Percentage** | *[untested]* % |
| **Final Battery Percentage** | *[untested]* % |
| **Total Session Duration** | *[untested]* minutes |
| **Battery Discharge Rate (% per hour)** | *[untested]* %/hr |
| **Chassis Surface Temperature (°C)** | *[untested]* °C |
| **Thermal Throttling Observed?** | [Yes / No] |

---

## 6. How to Run Measurement Commands on Windows

### A. Memory & Process Inspection
```powershell
Get-Process python, node | Select-Object ProcessName, Id, WorkingSet64, CPU
```

### B. Generate Battery Health Report
```powershell
powercfg /batteryreport /output "battery_report.html"
```
