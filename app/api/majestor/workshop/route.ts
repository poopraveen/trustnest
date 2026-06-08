import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

export async function POST(req: NextRequest) {
  const { components, goal, experience } = await req.json() as {
    components: { name: string; tags: string[] }[];
    goal?: string;
    experience?: string;
  };

  if (!components?.length) {
    return new Response(JSON.stringify({ error: "No components provided" }), { status: 400 });
  }

  const componentList = components
    .map(c => `- ${c.name} (tags: ${c.tags.join(", ")})`)
    .join("\n");

  const systemPrompt = `You are an expert electronics engineer and IoT architect helping makers design products.
Given a list of electronic components, you:
1. Suggest 3 creative, practical IoT/embedded projects they can build
2. For each project, provide: title, tagline, difficulty, estimated time, step-by-step build guide, required wiring notes, and Arduino/MicroPython code snippet
3. Identify any missing components needed and suggest them
4. Be specific, practical, and inspiring

Format your response as structured JSON with this schema:
{
  "projects": [
    {
      "id": "1",
      "title": "...",
      "tagline": "...",
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimatedTime": "...",
      "description": "...",
      "steps": ["step 1", "step 2", ...],
      "wiring": "wiring notes text",
      "codeSnippet": "// Arduino/Python code here",
      "codeLanguage": "arduino|python",
      "missingComponents": ["component 1", "component 2"],
      "useCases": ["use case 1", "use case 2"]
    }
  ],
  "tip": "Pro tip text here"
}`;

  const userPrompt = `I have these components:
${componentList}

${goal ? `My goal: ${goal}` : "Suggest the best projects for these components."}
${experience ? `My experience level: ${experience}` : ""}

Give me 3 project ideas I can build right now.`;

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify(MOCK_RESPONSE), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let full = "";
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        full += text;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

const MOCK_RESPONSE = {
  projects: [
    {
      id: "1",
      title: "Smart Home Weather Station",
      tagline: "Real-time temperature, humidity & air quality monitor on OLED",
      difficulty: "Beginner",
      estimatedTime: "2-3 hours",
      description: "Build a compact weather station that displays live sensor data on an OLED screen and pushes readings to a cloud dashboard via WiFi.",
      steps: [
        "Connect DHT11 sensor to ESP32 GPIO4 (data), 3.3V, GND",
        "Wire OLED display via I2C: SDA→GPIO21, SCL→GPIO22",
        "Install libraries: Adafruit_SSD1306, DHT sensor library",
        "Flash firmware with WiFi credentials",
        "Configure ThingSpeak channel for cloud logging",
        "3D-print enclosure and deploy"
      ],
      wiring: "DHT11: VCC→3.3V, GND→GND, DATA→GPIO4 (with 10kΩ pull-up)\nOLED: VCC→3.3V, GND→GND, SDA→GPIO21, SCL→GPIO22",
      codeSnippet: `#include <DHT.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>

#define DHTPIN 4
DHT dht(DHTPIN, DHT11);
Adafruit_SSD1306 display(128, 64, &Wire);

void setup() {
  dht.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  WiFi.begin("SSID", "PASSWORD");
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(0,0);
  display.printf("%.1f C\\n%.0f%%", temp, hum);
  display.display();
  delay(2000);
}`,
      codeLanguage: "arduino",
      missingComponents: ["DHT11/DHT22 Sensor", "Breadboard + Jumper wires"],
      useCases: ["Home automation", "Greenhouse monitoring", "Office environment tracking"]
    },
    {
      id: "2",
      title: "WiFi-Controlled LED Strip",
      tagline: "Control RGB lights from any device on your local network",
      difficulty: "Beginner",
      estimatedTime: "1-2 hours",
      description: "Create a WiFi-accessible web server on the ESP32 to control an RGB LED strip with a slick browser UI — no app needed.",
      steps: [
        "Connect RGB LED strip data pin to ESP32 GPIO13",
        "Power strip from 5V 2A supply (not from ESP32)",
        "Add 470Ω resistor on data line",
        "Flash ESP32 with AsyncWebServer firmware",
        "Access control panel at http://esp32.local"
      ],
      wiring: "LED Strip DATA→GPIO13 (via 470Ω resistor)\nLED Strip 5V→External 5V supply\nLED Strip GND→Common GND with ESP32",
      codeSnippet: `#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <FastLED.h>

#define LED_PIN 13
#define NUM_LEDS 30
CRGB leds[NUM_LEDS];
AsyncWebServer server(80);

void setup() {
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  WiFi.begin("SSID", "PASS");
  while (WiFi.status() != WL_CONNECTED) delay(500);

  server.on("/color", HTTP_GET, [](AsyncWebServerRequest *request) {
    String r = request->getParam("r")->value();
    fill_solid(leds, NUM_LEDS, CRGB(r.toInt(), 0, 0));
    FastLED.show();
    request->send(200, "text/plain", "OK");
  });
  server.begin();
}`,
      codeLanguage: "arduino",
      missingComponents: ["WS2812B LED Strip", "5V 2A Power Supply", "470Ω resistor"],
      useCases: ["Ambient lighting", "Mood lamp", "Alert system"]
    },
    {
      id: "3",
      title: "IoT Security Camera",
      tagline: "Live video stream accessible anywhere via browser",
      difficulty: "Intermediate",
      estimatedTime: "4-5 hours",
      description: "Turn your ESP32-CAM into a fully functional IP security camera with motion detection alerts sent to Telegram.",
      steps: [
        "Connect ESP32-CAM to FTDI adapter for programming (TX→RX0, RX→TX0, IO0→GND)",
        "Flash CameraWebServer example from Arduino IDE",
        "Configure WiFi credentials in code",
        "Remove IO0→GND jumper and reset",
        "Access stream at http://[IP]:80",
        "Add PIR sensor on GPIO13 for motion alerts",
        "Configure Telegram bot for push notifications"
      ],
      wiring: "For programming: FTDI VCC→5V, GND→GND, TX→U0R, RX→U0T, IO0→GND\nPIR Sensor: VCC→3.3V, GND→GND, OUT→GPIO13",
      codeSnippet: `// Include CameraWebServer from ESP32 Arduino examples
// Modify camera_pins.h for AI-THINKER model
// Add this for Telegram alerts:
#include <UniversalTelegramBot.h>
WiFiClientSecure client;
UniversalTelegramBot bot("BOT_TOKEN", client);

void IRAM_ATTR motionDetected() {
  bot.sendMessage("CHAT_ID", "🚨 Motion detected!", "");
}

void setup() {
  // ... camera init code ...
  pinMode(13, INPUT_PULLDOWN);
  attachInterrupt(13, motionDetected, RISING);
}`,
      codeLanguage: "arduino",
      missingComponents: ["FTDI Programmer", "PIR Motion Sensor", "Micro SD Card"],
      useCases: ["Home security", "Baby monitor", "Time-lapse photography"]
    }
  ],
  tip: "Start with Project 1 (Weather Station) — it requires the fewest additional components and gives you a solid foundation in ESP32 + sensor + display workflows."
};
