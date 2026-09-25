# Local AI Setup Guide for InterviewCoach AI

InterviewCoach AI supports a configurable local inference adapter capable of communicating with any server exposing an **OpenAI-compatible HTTP API** running on `localhost`.

You do **not** need a paid API key or an active internet connection to use local AI.

---

## 1. Option A: Ollama (Recommended for Ease of Use)

### Installation
1. Download Ollama for Windows from [https://ollama.com/download](https://ollama.com/download).
2. Install and launch the Ollama application.

### Pull a Recommended Placement Model
Open Windows PowerShell and run one of the following depending on your RAM:
```powershell
# For systems with 8GB RAM (Lightweight 3B parameter model)
ollama run phi3:mini

# For systems with 16GB+ RAM (8B parameter model, higher coaching accuracy)
ollama run llama3:8b

# For balanced speed and instruction adherence (7B model)
ollama run qwen2.5:7b
```

### Configure in InterviewCoach AI
1. Navigate to the **Settings** tab in InterviewCoach AI.
2. Toggle **Enable Local AI Inference** to ON.
3. Set **Local Inference Endpoint URL** to:
   ```
   http://127.0.0.1:11434/v1
   ```
4. Set **Model Identifier** to match the model you pulled (e.g., `llama3:8b` or `phi3:mini`).
5. Click **Test Connection**. A green indicator with latency will confirm connectivity.
6. Click **Save Settings**.

---

## 2. Option B: LM Studio (Recommended for GUI Control)

### Installation
1. Download and install LM Studio from [https://lmstudio.ai](https://lmstudio.ai).
2. Search and download a GGUF quantized model (e.g. `Meta-Llama-3-8B-Instruct-GGUF` at `Q4_K_M` quantization).

### Start the Local Server
1. Go to the **Local Server** tab (double-arrow icon) in LM Studio.
2. Select your downloaded model and click **Start Server**.
3. LM Studio typically starts on port `1234`.

### Configure in InterviewCoach AI
1. In InterviewCoach AI Settings, enter:
   ```
   Endpoint: http://127.0.0.1:1234/v1
   Model Identifier: (Name shown in LM Studio server header)
   ```
2. Click **Test Connection** to verify.

---

## 3. Option C: llama.cpp Server

For lightweight, command-line execution:
```powershell
# Start llama-server on localhost port 8080
./llama-server.exe -m ./models/llama-3-8b-instruct.Q4_K_M.gguf --port 8080 -c 4096
```
In InterviewCoach AI Settings:
```
Endpoint: http://127.0.0.1:8080/v1
Model Identifier: default
```

---

## 4. Hardware Requirements

| Configuration | Min RAM | Recommended Model | Quantization | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Budget / 8GB RAM** | 8 GB | `phi3:mini` (3.8B) | Q4_K_M | Low memory footprint, fast generation |
| **Standard / 16GB RAM** | 16 GB | `llama3:8b` or `mistral:7b` | Q4_K_M | High quality technical evaluation |
| **High Performance** | 32 GB | `qwen2.5-coder:14b` | Q4_K_M | Exceptional coding feedback |

---

## 5. Troubleshooting & Fallback
- **Connection Refused / ConnectError**: Ensure your local inference server (Ollama or LM Studio) is running before testing the connection.
- **Model Timeout**: If local inference takes longer than 20 seconds, InterviewCoach AI will automatically transition into **Basic Practice Mode**, ensuring you never lose your interview flow.
- **No Models Installed**: If you do not have an AI model installed, the application runs 100% functionally in **Basic Practice Mode** using our curated question bank, model answers, and self-review rubrics.
